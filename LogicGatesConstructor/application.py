import numpy as np
from PIL import Image
from flask import Flask, render_template, Response, request
import os

NOTHING = "nothing"
web_app = Flask(__name__, template_folder="./templates", static_folder='./static')


@web_app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


PREVIEW_IMAGE_KEYS = {"file_name", "image_data", "width", "height", "depth"}


def get_file_name(file_name: str, directory: str = None, suffix: str = None, override: bool = True):
    s_path = file_name.split('.')
    f_name = '.'.join(v for v in s_path[:-1])
    suffix = suffix if suffix else s_path[-1]
    full_file_name = f"{directory}\\{f_name}.{suffix}" if directory else f"{f_name}.{suffix}"
    idx = 1
    if override:
        return full_file_name
    while os.path.exists(full_file_name):
        full_file_name = f"{directory}\\{f_name}{idx}.{suffix}" if directory else f"{f_name}{idx}.{suffix}"
        idx += 1
    return full_file_name


def _save_preview_image(directory, args: dict, override=True):
    if len(args) == 0:
        return
    if any(key not in PREVIEW_IMAGE_KEYS for key in args.keys()):
        return
    try:
        width = int(args['width'])
        height = int(args['height'])
        image = np.array(tuple(ord(v) for v in args['image_data']), dtype='uint8')
        image = Image.frombytes("RGBA", (width, height), image)
        image.save(get_file_name(args['file_name'], directory=directory, override=override), mode="RGBA")
    except Exception as ex:
        print(f"{ex}")


def _save_dump(directory, args: dict, override=True):
    if len(args) == 0:
        return
    if any(key not in PREVIEW_IMAGE_KEYS for key in args.keys()):
        return
    full_file_name = get_file_name(args['file_name'], directory=directory, suffix='json', override=override)
    image_name = full_file_name.split('\\')[-1]
    image_name = f"{'.'.join(v for v in image_name.split('.')[:-1])}.{args['file_name'].split('.')[-1]}"
    with open(full_file_name, 'wt', encoding='utf-8') as out:
        print(f"{{\n"
              f"\t\"width\":  {args['width']},\n"
              f"\t\"height\": {args['height']},\n"
              f"\t\"depth\":  {args['depth']},\n"
              f"\t\"image\":  \"{image_name}\"\n"
              f"}}\n", file=out)


@web_app.route('/gate_image_preview_save', methods=['POST'])
def gate_image_preview_save():
    response = dict(request.form)
    _save_preview_image('visuals/gates_preview', response)
    _save_dump('visuals/gates_preview', response)
    return "nothing"


@web_app.route('/screen_shot_save', methods=['POST'])
def screen_shot_save():
    response = dict(request.form)
    _save_preview_image('visuals/screen_shots', response, False)
    _save_dump('visuals/screen_shots', response, False)
    return "nothing"


if __name__ == "__main__":
    web_app.run(debug=True, use_reloader=False)

