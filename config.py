import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from tavily import TavilyClient

# Load variables from .env file
load_dotenv()

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Hardened model configurations via OpenRouter
grader_llm = ChatOpenAI(
    model="openai/gpt-4o-mini", 
    base_url=OPENROUTER_BASE_URL,
    temperature=0
)

generator_llm = ChatOpenAI(
    model="openai/gpt-4o-mini", 
    base_url=OPENROUTER_BASE_URL,
    temperature=0.2
)

# Core web search tool
tavily_client = TavilyClient(api_key=os.environ.get("TAVILY_API_KEY"))