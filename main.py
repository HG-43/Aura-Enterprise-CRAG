from graph import app

def run_pipeline(user_query: str):
    print("=" * 60)
    print(f"STARTING APPLICATION QUERY: {user_query}")
    print("=" * 60)
    
    initial_state = {
        "question": user_query,
        "documents": [],
        "web_search_required": False,
        "generation": ""
    }
    
    final_output = initial_state
    
    # Process through the execution runtime state steps
    for event in app.stream(initial_state):
        for node_name, updated_state in event.items():
            final_output.update(updated_state)
            
    print("\n" + "="*25 + " RESULTS " + "="*25)
    if "generation" in final_output and final_output["generation"]:
        print(final_output["generation"])
    else:
        print("Pipeline finalized without compiling a message block output.")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    # Query 1: Triggers pure internal retrieval flow
    run_pipeline("What is the name of our core cluster and what OS does it run?")
    
    # Query 2: Triggers document fallback route directly to web search
    run_pipeline("Who won the latest Super Bowl game?")