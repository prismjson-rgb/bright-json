import { MAX_INPUT_CHARS } from "./input-limits";

/** LZ-string URI bitstream decoder with output and dictionary allocation budgets.
 * Compatible with lz-string 1.5; no unbounded decompression fallback.
 */
export function decodeBoundedLz(encoded: string, limit = MAX_INPUT_CHARS): string | null {
  if (!encoded || encoded.length > MAX_INPUT_CHARS * 2) return null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  const input = encoded.replace(/ /g, "+");
  let index = 0, mask = 0, current = 0;
  const read = (count: number): number => {
    let value = 0;
    for (let bit = 0; bit < count; bit++) {
      if (!mask) {
        if (index >= input.length) throw new Error("Truncated share");
        current = alphabet.indexOf(input[index++]);
        if (current < 0) throw new Error("Invalid share character");
        mask = 32;
      }
      if (current & mask) value += 2 ** bit;
      mask >>= 1;
    }
    return value;
  };
  try {
    const first = read(2);
    if (first === 2) return "";
    if (first > 1) return null;
    let previous = String.fromCharCode(read(first === 0 ? 8 : 16));
    const dictionary: string[] = ["", "", "", previous];
    const output = [previous];
    let size = previous.length, dictionaryChars = size, width = 3, remaining = 4;
    const add = (value: string) => {
      dictionaryChars += value.length;
      if (dictionaryChars > limit * 4 || dictionary.length > 100_000) throw new Error("Share dictionary limit");
      dictionary.push(value);
    };
    while (size <= limit) {
      let code = read(width);
      if (code === 2) return output.join("");
      if (code === 0 || code === 1) {
        add(String.fromCharCode(read(code === 0 ? 8 : 16)));
        code = dictionary.length - 1;
        remaining--;
      }
      if (!remaining) { remaining = 2 ** width; width++; }
      const entry = dictionary[code] || (code === dictionary.length ? previous + previous[0] : null);
      if (!entry) return null;
      size += entry.length;
      if (size > limit) return null;
      output.push(entry);
      add(previous + entry[0]);
      remaining--;
      previous = entry;
      if (!remaining) { remaining = 2 ** width; width++; }
    }
  } catch { return null; }
  return null;
}
