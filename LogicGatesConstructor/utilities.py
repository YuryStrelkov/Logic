from os.path import isfile, isdir, join
from flask import request
from os import listdir
from PIL import Image
import numpy as np
import io
import os

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


def _save_preview_image(directory, args: dict, override: bool = True):
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


def _save_dump(directory, args: dict, override: bool = True):
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


def image_preview_save(directory: str = None):
    response = dict(request.form)
    if directory:
        _save_preview_image(directory, response)
        _save_dump(directory, response)
    else:
        _save_preview_image('visuals/gates_preview', response)
        _save_dump('visuals/gates_preview', response)
    return "nothing"


def screenshot_save(directory: str = None):
    response = dict(request.form)
    if directory:
        _save_preview_image(directory, response)
        _save_dump(directory, response)
    else:
        _save_preview_image('visuals/screen_shots', response)
        _save_dump('visuals/screen_shots', response)
    return "nothing"


def read_image_as_bytes(image_src: str) -> bytes:
    frame = Image.open(image_src)
    buf = io.BytesIO()
    frame.save(buf, format='PNG')
    return b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + buf.getvalue() + b'\r\n'


SEPARATOR = '\\'


def compile_js_scripts(directory: str = None):
    directories = [directory] if directory else ['scripts']
    js_scripts = []
    while len(directories) != 0:
        c_dir = directories.pop()
        for file in listdir(c_dir):
            c_path = join(c_dir, file)
            if isdir(c_path):
                directories.append(c_path)
            if isfile(c_path) and c_path.endswith('js'):
                js_scripts.append(c_path)
    return [f"/{v.replace(SEPARATOR, '/')}" for v in js_scripts]
