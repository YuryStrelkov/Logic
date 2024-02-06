from utilities import screenshot_save, image_preview_save, read_image_as_bytes, compile_js_scripts
from flask import Flask, render_template, Response
import mimetypes

mimetypes.add_type('application/javascript', '.js')
print(mimetypes.guess_type("notExists.js"))

NOTHING = "nothing"
web_app = Flask(__name__, template_folder="./page", static_folder='./scripts')


@web_app.route('/', methods=['GET', 'POST'])
def index():
    scripts = ['/scripts/application.js']  # compile_js_scripts()
    print('\n'.join(v for v in scripts))
    return render_template('index.html', scripts=scripts)


@web_app.route('/gate_image_preview_save', methods=['POST'])
def gate_image_preview_save():
    return image_preview_save('visuals/gates_preview')


@web_app.route('/screen_shot_save', methods=['POST'])
def screen_shot_save():
    return screenshot_save('visuals/gates_preview')


def read_image(image_src: str) -> bytes:
    return read_image_as_bytes(image_src)


# @web_app.route('/get_frame')
# def get_image():
#     return Response(read_image(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    web_app.run(debug=True, use_reloader=False)

