"""Methods for interacting with vector database"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

import os
import chromadb
import uuid


def get_chroma_client():
    client = chromadb.CloudClient(
      api_key=os.environ['CHROMA_API_KEY'],
      tenant=os.environ['CHROMA_TENENT'],
      database=os.environ['CHROMA_DATABASE']
    )
    return client


# function for chunking a given document using semantic chunking
def chunk_document(
    document_path: str, chunk_size: int = 1000, chunk_overlap: int = 200
) -> list[str]:
    """
    Reads a document from the given path and splits it into chunks using RecursiveCharacterTextSplitter.

    Args:
        document_path (str): Path to the document file (e.g., .md or .txt).
        chunk_size (int): The maximum size of each chunk.
        chunk_overlap (int): The overlap between chunks.

    Returns:
        list[str]: A list of text chunks.
    """
    if not os.path.exists(document_path):
        raise FileNotFoundError(f"The file {document_path} was not found.")

    with open(document_path, "r", encoding="utf-8") as f:
        document_content = f.read()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_text(document_content)
    return chunks


def write_to_chroma(
    chunks: list[str], collection_name: str, persist_directory: str = "./data/chroma_db"
):
    """
    Writes the given chunks to a ChromaDB collection.

    Args:
        chunks (list[str]): The list of text chunks to store.
        collection_name (str): The name of the ChromaDB collection.
        persist_directory (str): The directory to persist the ChromaDB data.
    """
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=collection_name)

    ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(documents=chunks, ids=ids)
    print(f"Successfully added {len(chunks)} chunks to collection '{collection_name}'.")


def query_chroma(collection_name: str):
    client = get_chroma_client()
    collection = client.get_collection(name=collection_name)
    results = collection.query(
        query_texts=[
            "Get details about CTC"
        ],  # Chroma will embed this for you
        n_results=5,  # how many results to return
    )
    return results


if __name__ == "__main__":
    load_dotenv()
    # document_path = "data/extracts/sc-5.md"  # Replace with your document path
    # chunks = chunk_document(document_path)
    # write_to_chroma(chunks, "contracts")  # Replace with your desired collection name
    from pprint import pprint
    # print(f"Number of chunks: {len(chunks)}")uv    
    results = query_chroma('contracts')
    pprint(results)