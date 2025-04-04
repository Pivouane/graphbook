import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

async function main() {
  console.log("🚀 Populating MongoDB...");

  await prisma.post.deleteMany();
  await prisma.user.deleteMany({
    where: { emailVerified: false },
  });

  // 1️⃣ Créer des utilisateurs
  const users = await Promise.all([
    prisma.user.create({ data: { email: "alice@example.com", name: "Alice", username: "alice" } }),
    prisma.user.create({ data: { email: "bob@example.com", name: "Bob", username: "bob" } }),
    prisma.user.create({ data: { email: "charlie@example.com", name: "Charlie", username: "charlie" } }),
    prisma.user.create({ data: { email: "david@example.com", name: "David", username: "david" } }),
    prisma.user.create({ data: { email: "harrys.kedjnane@epita.fr", name: "Harrys", username: "harrys" } }),
    prisma.user.create({ data: { email: "daniel.xu@epita.fr", name: "Daniel", username: "daniel" } }),
  ]);

  // 2️⃣ Créer des posts (chaque utilisateur écrit sur un autre)
  await Promise.all([
    prisma.post.create({ data: { title: "Hello Bob!", content: "Hey Bob!", authorId: users[0].id, userId: users[1].id } }),
    prisma.post.create({ data: { title: "Hey Alice!", content: "Yo Alice!", authorId: users[1].id, userId: users[0].id } }),
    prisma.post.create({ data: { title: "To Charlie", content: "How are you?", authorId: users[2].id, userId: users[3].id } }),
    prisma.post.create({ data: { title: "For David", content: "Let's meet!", authorId: users[3].id, userId: users[2].id } }),
  ]);

  // 3️⃣ Ajouter des relations de favoris
  await prisma.user.update({
    where: { id: users[0].id },
    data: { favoriteIDs: [users[1].id, users[2].id] },
  });
  await prisma.user.update({
    where: { id: users[1].id },
    data: { favoriteIDs: [users[0].id] },
  });

  await prisma.user.update({
    where: { id: users[4].id },
    data: { favoriteIDs: [users[5].id], favoritedByIDs: [users[5].id] },
  });

  await prisma.user.update({
    where: { id: users[5].id },
    data: { favoriteIDs: [users[4].id], favoritedByIDs: [users[4].id] },
  });

  console.log("✅ Database populated!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
