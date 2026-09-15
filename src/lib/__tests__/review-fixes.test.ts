import { describe, expect, it, vi, afterEach } from "vitest";
import LZString from "lz-string";
import { decodeBoundedLz } from "../bounded-lz";
import { assertInputBudget, readBoundedText } from "../input-limits";
import { formatJsonPrecisely, parseJsonSafe } from "../precise-json";
import { jsonToXml } from "../json-to-xml";
import { jsonToCsv } from "../json-to-csv";
import { compressToBase64Url, decompressFromBase64Url } from "../compress-stream";
import { validateJsonAgainstSchema } from "../json-schema-validate";
import { validateSchemaAsync } from "../schema-worker-client";
import { readPreference, writePreference } from "../local-preferences";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("bounded inputs and numeric preservation", () => {
  it("preserves integer, decimal, exponent and negative-zero tokens when formatting and sorting", () => {
    const input = '{"z":9007199254740993,"a":[1.234567890123456789,1e400,-0],"__proto__":7}';
    const output = formatJsonPrecisely(input, 0, true);
    expect(output).toBe('{"__proto__":7,"a":[1.234567890123456789,1e400,-0],"z":9007199254740993}');
    expect(() => parseJsonSafe(input)).toThrow("cannot represent safely");
    expect(parseJsonSafe('{"id":"9007199254740993","amount":0.1}')).toEqual({ id: "9007199254740993", amount: 0.1 });
  });
  it("checks depth outside strings and enforces input/work limits", () => {
    expect(() => assertInputBudget('"' + '['.repeat(100) + '"')).not.toThrow();
    expect(() => assertInputBudget('['.repeat(65))).toThrow("nesting");
    expect(() => assertInputBudget(' '.repeat(1_000_001))).toThrow("character");
    expect(() => assertInputBudget('[' + '0,'.repeat(50_001))).toThrow("work limit");
  });
  it("preserves escaped keys, duplicate keys and objects resembling number wrappers", () => {
    expect(formatJsonPrecisely('{"isLosslessNumber":true,"value":"oops","__proto__":{"a":1}}', 0)).toBe('{"isLosslessNumber":true,"value":"oops","__proto__":{"a":1}}');
    expect(formatJsonPrecisely('{"a":1,"a":2,"\\u0062":"\\\"9007199254740993"}', 0)).toBe('{"a":1,"a":2,"\\u0062":"\\\"9007199254740993"}');
  });
  it("counts UTF-8 response bytes and cancels the source before buffering overflow", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream({ pull(controller) { controller.enqueue(new TextEncoder().encode('😀')); }, cancel });
    await expect(readBoundedText(stream, undefined, 7)).rejects.toThrow("limit");
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("cancels a stalled stream on caller abort", async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    const result = readBoundedText(new ReadableStream({ cancel }), controller.signal);
    controller.abort();
    await expect(result).rejects.toThrow("cancelled");
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("decodes legacy shares including Unicode and rejects expansion overflow", () => {
    for (const input of ['hello', '😀 العربية 日本語', JSON.stringify({ a: Array.from({ length: 500 }, (_, i) => `value-${i}`) }), 'x'.repeat(20_000)]) {
      expect(decodeBoundedLz(LZString.compressToEncodedURIComponent(input))).toBe(input);
    }
    expect(decodeBoundedLz(LZString.compressToEncodedURIComponent('x'.repeat(100_000)), 100)).toBeNull();
    expect(decodeBoundedLz('%%%')).toBeNull();
  });
  it("bounds native decompression and preserves supported shares", async () => {
    expect(await decompressFromBase64Url(await compressToBase64Url('hello 😀'))).toBe('hello 😀');
    const stream = new Blob(['x'.repeat(4_000_001)]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const encoded = Buffer.from(await new Response(stream).arrayBuffer()).toString('base64url');
    await expect(decompressFromBase64Url(encoded)).rejects.toThrow("limit");
  });
});

describe("exports", () => {
  it("declares xsi, normalizes every tag and handles root null", () => {
    const xml = jsonToXml({ '.bad': null, '-tag': '<&' }, '9root');
    expect(xml).toContain('<_9root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    expect(xml).toContain('<_.bad xsi:nil="true" />');
    expect(xml).toContain('<_-tag>&lt;&amp;</_-tag>');
    expect(jsonToXml(null)).toContain('xsi:nil="true"');
    expect(() => jsonToXml({ a: '\u0000' })).toThrow("XML 1.0");
    expect(() => jsonToXml({ 'a b': 1, 'a_b': 2 })).toThrow("collide");
  });
  it("protects CSV formulas including headers and retains numeric negatives", () => {
    expect(jsonToCsv([{ '=heading': '=1+1', x: '\t@SUM(A1)', y: -3 }])).toBe("'=heading,x,y\n'=1+1,'\t@SUM(A1),-3");
    expect(jsonToCsv([{ x: '=1+1' }], false)).toBe('x\n=1+1');
    expect(jsonToCsv([{ x: 'a\rb' }])).toBe('x\n"a\rb"');
  });
});

describe("schema and restricted storage", () => {
  it("validates Draft 7 and rejects oversized schemas and unsafe numbers", () => {
    expect(validateJsonAgainstSchema('{"id":1}', '{"type":"object","required":["id"]}').status).toBe('valid');
    expect(validateJsonAgainstSchema('{}', '{"type":"object","required":["id"]}').status).toBe('invalid');
    expect(validateJsonAgainstSchema('{}', ' '.repeat(100_001)+'{}').status).toBe('schema-error');
    expect(validateJsonAgainstSchema('9007199254740993', '{"type":"number"}').status).toBe('json-error');
  });
  it("terminates a stuck schema worker and cancels superseded work", async () => {
    vi.useFakeTimers();
    const terminate = vi.fn();
    vi.stubGlobal('Worker', class { terminate = terminate; postMessage() {} });
    const controller = new AbortController();
    const result = validateSchemaAsync('{}', '{}', controller.signal);
    await vi.advanceTimersByTimeAsync(2001);
    expect((await result).schemaErrorMsg).toContain('2 seconds');
    expect(terminate).toHaveBeenCalledOnce();
    const next = validateSchemaAsync('{}', '{}', controller.signal);
    controller.abort();
    expect((await next).schemaErrorMsg).toContain('cancelled');
    expect(terminate).toHaveBeenCalledTimes(2);
  });
  it("does not crash when preference storage is blocked", () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } });
    expect(readPreference('theme')).toBeNull();
    expect(writePreference('theme','dark')).toBe(false);
  });
});
