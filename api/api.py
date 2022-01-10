import pandas as pd
import numpy as np
from flask import Flask, send_file, request, current_app
import os
from designer import generate_design

app = Flask(__name__, static_folder="../build", static_url_path="/")

# if __name__ == '__main__':
#     app.run(debug=True, use_debugger=False, use_reloader=False, passthrough_errors=True)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

@app.route("/api/get_aug_md_design", methods = ['POST'])
def get_aug_md_design():
    payload = request.get_json() or {}
    print(payload.get('data'))
    print(payload)
    # make a good place to save the file
    if not os.path.exists(current_app.instance_path):
        os.mkdir(current_app.instance_path)
    if not os.path.exists(os.path.join(current_app.instance_path, "files")):
        os.mkdir(os.path.join(current_app.instance_path, "files"))
    design_fn =  os.path.join(
            current_app.instance_path, "files", "AugMdDesign.csv")
    augmd_df = generate_design(payload["versions"], payload["numOfItems"], payload["screens"], payload["maxItemsPerScreen"], payload["screensWithMaxItems"])
    augmd_df.to_csv(design_fn, index=False)
    return send_file(
        design_fn,
        mimetype=(
            "text/csv"
        ),
        as_attachment=True,
        cache_timeout=0,
    )

