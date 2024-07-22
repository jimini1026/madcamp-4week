import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  const { email, title } = req.query;

  if (!email || !title) {
    return res
      .status(400)
      .json({ error: "Email and title parameters are required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const data = await db
      .collection("user_self_introduction")
      .findOne({ email, title });

    if (!data) {
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
