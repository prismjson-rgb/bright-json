// Lightweight fake data generator — no external dependencies

const firstNames = ["Alice","Bob","Carlos","Diana","Eve","Frank","Grace","Henry","Isabel","Jack","Karen","Liam","Maya","Noah","Olivia","Peter","Quinn","Rachel","Sam","Tara","Uma","Victor","Wendy","Xander","Yara","Zoe"];
const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Young","Allen"];
const domains = ["gmail.com","yahoo.com","hotmail.com","outlook.com","proton.me","icloud.com"];
const cities = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte"];
const streets = ["Main St","Oak Ave","Elm St","Park Blvd","Maple Dr","Cedar Ln","Pine Rd","Washington Ave","Lake Dr","River Rd"];
const countries = ["US","CA","GB","AU","DE","FR","JP","IN","BR","MX"];
const roles = ["admin","user","moderator","editor","viewer","developer","analyst","manager"];
const categories = ["Electronics","Clothing","Books","Sports","Home","Garden","Toys","Food","Health","Beauty"];
const statuses = ["pending","processing","shipped","delivered","cancelled","refunded"];
const tags = ["tech","design","marketing","sales","support","engineering","product","finance","hr","legal"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function randomDate(start = new Date(2020, 0, 1), end = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function formatDate(d: Date, fmt: "iso" | "unix" | "human"): string | number {
  if (fmt === "unix") return Math.floor(d.getTime() / 1000);
  if (fmt === "human") return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return d.toISOString();
}
function randomEmail(first: string, last: string): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}@${rand(domains)}`;
}
function randomPhone(): string {
  return `+1-${randInt(200,999)}-${randInt(100,999)}-${randInt(1000,9999)}`;
}

export type MockTemplate = "user" | "product" | "order" | "blogpost" | "custom";
export type DateFormat = "iso" | "unix" | "human";

export interface CustomField { name: string; type: "string" | "number" | "boolean" | "email" | "uuid" | "date"; }

export function generateMockJson(opts: {
  template: MockTemplate;
  count: number;
  nested: boolean;
  dateFormat: DateFormat;
  customFields?: CustomField[];
}): unknown {
  const { template, count, nested, dateFormat, customFields } = opts;
  const items = Array.from({ length: count }, () => generateOne(template, nested, dateFormat, customFields));
  return count === 1 ? items[0] : items;
}

function generateOne(template: MockTemplate, nested: boolean, dateFormat: DateFormat, customFields?: CustomField[]): unknown {
  switch (template) {
    case "user": return generateUser(nested, dateFormat);
    case "product": return generateProduct(nested, dateFormat);
    case "order": return generateOrder(nested, dateFormat);
    case "blogpost": return generateBlogPost(nested, dateFormat);
    case "custom": return generateCustom(customFields ?? [], dateFormat);
  }
}

function generateUser(nested: boolean, dateFormat: DateFormat): unknown {
  const first = rand(firstNames), last = rand(lastNames);
  return {
    id: uuid(),
    name: `${first} ${last}`,
    email: randomEmail(first, last),
    age: randInt(18, 65),
    phone: randomPhone(),
    role: rand(roles),
    ...(nested ? {
      address: {
        street: `${randInt(100, 9999)} ${rand(streets)}`,
        city: rand(cities),
        zip: `${randInt(10000, 99999)}`,
        country: rand(countries),
      }
    } : { city: rand(cities) }),
    createdAt: formatDate(randomDate(), dateFormat),
    active: Math.random() > 0.2,
  };
}

function generateProduct(nested: boolean, dateFormat: DateFormat): unknown {
  const name = `${rand(["Pro","Ultra","Smart","Classic","Eco"])} ${rand(["Widget","Gadget","Device","Tool","Kit"])}`;
  return {
    id: uuid(),
    sku: `SKU-${randInt(1000, 9999)}`,
    name,
    price: randFloat(1.99, 999.99),
    category: rand(categories),
    stock: randInt(0, 500),
    rating: randFloat(1, 5, 1),
    ...(nested ? { tags: [rand(tags), rand(tags)].filter((v, i, a) => a.indexOf(v) === i) } : {}),
    imageUrl: `https://example.com/images/${uuid()}.jpg`,
    createdAt: formatDate(randomDate(), dateFormat),
    available: Math.random() > 0.15,
  };
}

function generateOrder(nested: boolean, dateFormat: DateFormat): unknown {
  const itemCount = randInt(1, 5);
  const items = Array.from({ length: itemCount }, () => ({
    productId: uuid(),
    name: `Product ${randInt(100, 999)}`,
    qty: randInt(1, 10),
    price: randFloat(5, 200),
  }));
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  return {
    orderId: uuid(),
    userId: uuid(),
    ...(nested ? { items } : { itemCount }),
    total: parseFloat(total.toFixed(2)),
    status: rand(statuses),
    createdAt: formatDate(randomDate(new Date(2023, 0, 1)), dateFormat),
    shippedAt: Math.random() > 0.4 ? formatDate(randomDate(), dateFormat) : null,
  };
}

function generateBlogPost(nested: boolean, dateFormat: DateFormat): unknown {
  const title = `${rand(["How to","Why You Should","Understanding","The Guide to","Mastering"])} ${rand(["JSON","APIs","Data","TypeScript","React","Next.js","Performance","Security"])}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const first = rand(firstNames), last = rand(lastNames);
  return {
    id: uuid(),
    title,
    slug,
    ...(nested ? {
      author: { name: `${first} ${last}`, email: randomEmail(first, last) },
      tags: [rand(tags), rand(tags), rand(tags)].filter((v, i, a) => a.indexOf(v) === i),
    } : {
      author: `${first} ${last}`,
    }),
    views: randInt(10, 50000),
    likes: randInt(0, 1000),
    publishedAt: formatDate(randomDate(new Date(2022, 0, 1)), dateFormat),
    draft: Math.random() < 0.2,
  };
}

function generateCustom(fields: CustomField[], dateFormat: DateFormat): unknown {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.type) {
      case "string": obj[f.name] = rand([...firstNames, ...lastNames]); break;
      case "number": obj[f.name] = randInt(1, 1000); break;
      case "boolean": obj[f.name] = Math.random() > 0.5; break;
      case "email": obj[f.name] = randomEmail(rand(firstNames), rand(lastNames)); break;
      case "uuid": obj[f.name] = uuid(); break;
      case "date": obj[f.name] = formatDate(randomDate(), dateFormat); break;
    }
  }
  return obj;
}
