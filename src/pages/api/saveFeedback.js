import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, title, QnA, feedbackResult } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const collection = db.collection("user_interview_feedback");

    const document = {
      email,
      title,
      QnA,
      feedbackResult,
    };

    const result = await collection.insertOne(document);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to register use interview feedback" });
  }
};
