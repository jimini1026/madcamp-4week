import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, title, content } = req.body;

  try {
    const client = await clientPromise; 
    const db = client.db("madcamp4");
    const collection = db.collection("user_self_introduction");

    const existingTitle = await collection.findOne({ email, title });
    if (existingTitle) {
      return res.status(400).json({ message: "Title already exists" });
    }

    const result = await collection.insertOne({ email, title, content });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register selfIntroduction" });
  }
};
