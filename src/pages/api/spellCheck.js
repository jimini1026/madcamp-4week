import hanspell from "hanspell";

export default async function handler(req, res) {
  console.log("SpellCheck API called!");

  if (req.method === "POST") {
    const { sentence } = req.body;

    try {
      const results = await new Promise((resolve, reject) => {
        hanspell.spellCheckByDAUM(
          sentence,
          6000,
          resolve,
          (err) => resolve([]),
          reject
        );
      });

      res.status(200).json({ results });
    } catch (error) {
      console.error("Spell check failed: ", error);
      res
        .status(500)
        .json({ error: "Spell check failed", details: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
