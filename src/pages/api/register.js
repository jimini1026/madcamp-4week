import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, password } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const collection = db.collection("users");

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const result = await collection.insertOne({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
};
