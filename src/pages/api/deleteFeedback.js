import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, title } = req.body;

  if (!email || !title) {
    return res.status(400).json({ message: "Email and title are required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");
    const collection = db.collection("user_interview_feedback");

    const result = await collection.deleteOne({ email, title });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found with the given email and title" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
};
