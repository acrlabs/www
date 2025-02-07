import re
import logging

log = logging.getLogger(f"mkdocs.plugins.{__name__}")
EMPTY_CELL_REGEX = re.compile(r"<td></td>")


def on_page_content(html, page, config, files):
    if re.search(EMPTY_CELL_REGEX, html):
        log.warning(
            f"Found empty table cells in generated HTML on {page.file.src_uri}; removing them"
        )
    return re.sub(EMPTY_CELL_REGEX, "", html)
