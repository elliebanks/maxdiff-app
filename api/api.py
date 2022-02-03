import pandas as pd
import numpy as np
from flask import Flask, send_file, request, current_app
import os
from designer import generate_design, get_sample_design

app = Flask(__name__, static_folder="../build", static_url_path="/")


# if __name__ == '__main__':
#     app.run(debug=True, use_debugger=False, use_reloader=False, passthrough_errors=True)

@app.route('/')
def index():
	return app.send_static_file('index.html')


@app.errorhandler(404)
def not_found(e):
	return app.send_static_file('index.html')


@app.route("/api/get_aug_md_design", methods=['POST'])
def get_aug_md_design():
	payload = request.get_json() or {}
	print(payload.get('data'))
	print(payload)
	# make a good place to save the file
	if not os.path.exists(current_app.instance_path):
		os.mkdir(current_app.instance_path)
	if not os.path.exists(os.path.join(current_app.instance_path, "files")):
		os.mkdir(os.path.join(current_app.instance_path, "files"))
	design_fn = os.path.join(
		current_app.instance_path, "files", "AugMdDesign.csv")
	augmd_df = generate_design(payload["versions"], payload["numOfItems"], payload["screens"],
							   payload["maxItemsPerScreen"], payload["screensWithMaxItems"])
	augmd_df.to_csv(design_fn, index=False)
	return send_file(
		design_fn,
		mimetype=(
			"text/csv"
		),
		as_attachment=True,
		cache_timeout=0,
	)


@app.route("/api/get_version_preview", methods=['POST'])
def get_version_preview():
	payload = request.get_json() or {}
	print(payload.get('data'))
	print(payload)
	number_of_items = payload.get("numOfItems")
	screens = payload.get("screens")
	result = get_sample_design(payload["versions"], payload["numOfItems"], payload["screens"],
							   payload["maxItemsPerScreen"],
							   payload["screensWithMaxItems"])

	print(result)

	error_messages = []

	designer_returned_an_error = isinstance(result, str)
	if designer_returned_an_error:
		print("Designer returned an error, not running additional checks")
		return {"message": result}, 400

	# prints the first list of lists from the result
	list1 = result[0]
	print(list1)

	# checks for screens with length of 1 or 0 in the list of lists
	# checks for screens with less than 2 items
	error_found = False
	for screens in list1:
		print(len(screens))
		if len(screens) <= 1 or len(screens) - screens.count('') < 2:
			error_found = True

	# error message set up outside the for loop to prevent repeated messages

	if error_found:
		error_message = 'Based on these parameters you do not have enough items per screen to create a design.'
		error_messages.append(error_message)

	# checks if an error message is present and returns it to the front end
	# if no error message is found, returns a sample design
	if len(error_messages) > 0:
		return {"message": error_messages}, 400
	return {"sample_design": result[0]}

# return {"message": ", ".join(error_messages)}, 400
