import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method === "POST") {
    const { email, imageKey } = req.body;

    if (!email || !imageKey) {
      return res
        .status(400)
        .json({ error: "Email and image key are required" });
    }

    try {
      const client = await clientPromise;
      const db = client.db("madcamp4");
      const result = await db
        .collection("user_etc")
        .updateOne({ email }, { $set: { imageKey } }, { upsert: true });

      res.status(200).json({ message: "Profile image key saved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save profile image key" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
