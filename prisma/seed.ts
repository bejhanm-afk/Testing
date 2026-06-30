import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BLOCK_DEFINITIONS, createBlockInstance } from "../src/blocks/definitions";

const prisma = new PrismaClient();

/** Build a page's block array from a list of block types using their defaults. */
function page(types: string[]): Prisma.InputJsonValue {
  return types.map((t) => createBlockInstance(t)) as unknown as Prisma.InputJsonValue;
}

async function main() {
  console.log("Seeding block catalogue...");
  for (const def of BLOCK_DEFINITIONS) {
    await prisma.block.upsert({
      where: { type: def.type },
      update: {
        name: def.name,
        category: def.category,
        icon: def.icon,
        schema: def.fields as unknown as object,
        defaultData: def.defaultData as object,
      },
      create: {
        type: def.type,
        name: def.name,
        category: def.category,
        icon: def.icon,
        schema: def.fields as unknown as object,
        defaultData: def.defaultData as object,
      },
    });
  }

  console.log("Seeding templates...");
  const templates: Array<{
    name: string;
    description: string;
    category: string;
    structure: Prisma.InputJsonValue;
  }> = [
    {
      name: "Zakelijk",
      description: "Strakke bedrijfssite met hero, kenmerken en contact.",
      category: "Business",
      structure: {
        pages: [
          { title: "Home", slug: "", content: page(["hero", "features", "text", "contactForm"]) },
          { title: "Over ons", slug: "over-ons", content: page(["text", "features"]) },
        ],
      },
    },
    {
      name: "Portfolio",
      description: "Toon je werk met grote beelden.",
      category: "Creative",
      structure: {
        pages: [
          { title: "Home", slug: "", content: page(["hero", "image", "text"]) },
          { title: "Contact", slug: "contact", content: page(["contactForm"]) },
        ],
      },
    },
    {
      name: "Landingspagina",
      description: "Eén pagina, gericht op conversie.",
      category: "Marketing",
      structure: {
        pages: [{ title: "Home", slug: "", content: page(["hero", "features", "button", "contactForm"]) }],
      },
    },
  ];

  for (const t of templates) {
    const existing = await prisma.template.findFirst({ where: { name: t.name } });
    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: { description: t.description, category: t.category, structure: t.structure },
      });
    } else {
      await prisma.template.create({ data: t });
    }
  }

  console.log("Seeding super-admin user...");
  const adminEmail = "admin@platform.nl";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { globalRole: "SUPER_ADMIN" },
    create: {
      email: adminEmail,
      name: "Platform Admin",
      passwordHash: await bcrypt.hash("admin1234", 10),
      globalRole: "SUPER_ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log("  Super-admin login: admin@platform.nl / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
