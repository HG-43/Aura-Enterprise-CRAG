from langgraph.graph import END, StateGraph
from state import GraphState
from nodes import retrieve, grade_documents, web_search, route_after_grading, generate

# Instantiate the graph layout
workflow = StateGraph(GraphState)

# Assign nodes
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("web_search_node", web_search)
workflow.add_node("generate_node", generate)

# Construct routing topology
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "grade_documents")

workflow.add_conditional_edges(
    "grade_documents",
    route_after_grading,
    {
        "web_search_node": "web_search_node",
        "generate_node": "generate_node"
    }
)

workflow.add_edge("web_search_node", "generate_node")
workflow.add_edge("generate_node", END)

app = workflow.compile()