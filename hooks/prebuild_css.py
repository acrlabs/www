import logging

THEME_STYLE_CSS = "css/style.css"
log = logging.getLogger(f"mkdocs.plugins.{__name__}")


def on_files(files, config):
    style_css = files.get_file_from_path(THEME_STYLE_CSS)
    for extra_css_file in config.extra_css:
        log.info(f"Appending {extra_css_file} to {THEME_STYLE_CSS}")
        extra_css = files.get_file_from_path(extra_css_file)
        style_css.content_string += extra_css.content_string
        files.remove(extra_css)
