"""
Launch helper: sets the protobuf env-var BEFORE Streamlit (or paddle) imports
protobuf, then starts the Streamlit app normally.

Usage:
    python launch.py
"""
import os

# Must happen before ANY import of google.protobuf (including Streamlit's own)
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from streamlit.web import cli as stcli
import sys

sys.argv = ["streamlit", "run", "streamlit_app.py"]
sys.exit(stcli.main())
