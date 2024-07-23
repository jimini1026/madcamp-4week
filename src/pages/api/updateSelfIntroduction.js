import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, title, content } = req.body;

  if (!email || !title || !content) {
    return res
      .status(400)
      .json({ error: "Email, title, and content parameters are required." });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");

    const result = await db
      .collection("user_self_introduction")
      .updateOne({ email, title }, { $set: { content } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Data not found to update." });
    }

    res.status(200).json({ message: "Data successfully updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update data." });
  }
};
