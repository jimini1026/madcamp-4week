import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const collection = db.collection("user_interview_feedback");

    const feedbackData = await collection.find({ email }).toArray();

    if (feedbackData.length === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found for the given email" });
    }

    res.status(200).json(feedbackData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch interview feedback" });
  }
};
