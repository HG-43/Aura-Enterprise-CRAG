# ingest.py
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Create a local embedding model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Create some sample company data
docs = [
    Document(page_content="The enterprise core deployment cluster is named 'Apollo-X'. It runs on Ubuntu 24.04 LTS."),
    Document(page_content="The CEO of the company is Jane Doe. She assumed the role in 2023."),
    Document(page_content="Company Q3 Revenue was $4.2 Million, driven primarily by the new SaaS product.")
]

# 3. Build and save the Chroma Vector Store locally
vectorstore = Chroma.from_documents(
    documents=docs, 
    embedding=embeddings, 
    persist_directory="./chroma_db"
)

print("Database successfully built and saved to ./chroma_db!")