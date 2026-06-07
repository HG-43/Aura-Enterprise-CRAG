from typing import TypedDict, List

class GraphState(TypedDict):
    """
    Represents the complete state of our CRAG architecture.
    """
    question: str
    generation: str
    web_search_required: bool
    documents: List[str]