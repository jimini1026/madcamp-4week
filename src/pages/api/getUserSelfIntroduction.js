import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const data = await db
      .collection("user_self_introduction")
      .find({ email })
      .toArray();

    if (data.length === 0) {
      // Instead of using alert, return a response with status 404
      return res.status(404).json({ error: "No data found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
