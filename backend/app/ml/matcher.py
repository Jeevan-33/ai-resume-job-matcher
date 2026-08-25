from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match_score(resume_text: str, job_description: str) -> float:
    # If either text is completely empty, it's a 0% match
    if not resume_text or not job_description:
        return 0.0

    # Initialize TF-IDF, ignoring common English stop words ("the", "is", "at")
    vectorizer = TfidfVectorizer(stop_words='english')

    # Convert the texts into a matrix of numbers
    tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])

    # Calculate Cosine Similarity between the first item (resume) and second (job)
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    # Convert to a clean percentage (e.g., 0.753 -> 75.3)
    return round(similarity * 100, 2)