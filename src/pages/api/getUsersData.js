import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const data = await db.collection("users").findOne({ email });

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
