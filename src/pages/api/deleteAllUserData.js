import clientPromise from "../../app/lib/mongodb";

export default async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email과 title 파라미터가 필요합니다." });
  }

  try {
    const client = await clientPromise;
    const db = client.db("madcamp4");

    // user_etc 컬렉션에서 삭제
    const deleteUserEtc = db.collection("user_etc").deleteMany({ email });

    // user_self_introduction 컬렉션에서 삭제
    const deleteUserSelfIntroduction = db
      .collection("user_self_introduction")
      .deleteMany({ email });

    // users 컬렉션에서 삭제
    const deleteUsers = db.collection("users").deleteMany({ email });

    // 모든 삭제 작업을 병렬로 실행
    const results = await Promise.all([
      deleteUserEtc,
      deleteUserSelfIntroduction,
      deleteUsers,
    ]);

    const totalDeletedCount = results.reduce(
      (acc, result) => acc + result.deletedCount,
      0
    );

    if (totalDeletedCount === 0) {
      return res
        .status(404)
        .json({ error: "삭제할 데이터를 찾을 수 없습니다." });
    }

    res
      .status(200)
      .json({
        message: "데이터가 성공적으로 삭제되었습니다.",
        totalDeletedCount,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "데이터 삭제에 실패했습니다." });
  }
};
