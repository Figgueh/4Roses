import { generateArticleFromUrl } from "connection/openRouter/generateArticleFromUrl";
import { useEffect, useState } from "react";

function ActivityEditor() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // const article = await generateArticleFromUrl("https://www.slidesplash.com/servicos/");
      const article = await generateArticleFromUrl("https://www.skydivealgarve.com/about/");
      // const article = await generateArticleFromUrl("https://www.slidesplash.com/");
      const cleaned = article.replace(/```json|```/g, "").trim();
      setGeneratedArticle(JSON.parse(cleaned));
      setIsLoading(false);
    };
    fetchData();
    console.log(generatedArticle);
  }, []);

  return (
    <>
      {isLoading && <p>Generating article...</p>}

      {generatedArticle && (
        <div>
          <h2>{generatedArticle.title}</h2>
          {generatedArticle.article.map((section, idx) => (
            <div key={idx}>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
              <ul>
                {section.detail?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ActivityEditor;
