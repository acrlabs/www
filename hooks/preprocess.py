COMMENT_OPEN = "<!--\n"
COMMENT_CLOSE = "-->\n"
YAML_META_TAG = "---\n"

# Replace HTML comment markers at the beginning of the file
# with YAML metadata tags, e.g., 
#
#   <!--
#   foo: bar
#   -->
#
# will become
#
#   ---
#   foo: bar
#   ---
#
# The opening lines must match EXACTLY, e.g., no white space at the end.
def on_page_read_source(page, config):
    print(page.file.abs_src_path)
    with open(page.file.abs_src_path) as f:
        lines = f.readlines()
        if lines[0] == COMMENT_OPEN:
            lines[0] = YAML_META_TAG
            close_index = lines.index(COMMENT_CLOSE)
            lines[close_index] = YAML_META_TAG

        indent_next = False
        for i in range(len(lines)):
            if lines[i].startswith('> [!WARNING]'):
                print('translating warning')
                lines[i] = lines[i].replace('> [!WARNING]', '!!! warning')
                indent_next = True
            elif lines[i].startswith('> [!NOTE]'):
                print('translating note')
                lines[i] = lines[i].replace('> [!NOTE]', '!!! note')
                indent_next = True
            elif indent_next:
                if lines[i].strip() == '':
                    indent_next = False
                else:
                    if lines[i][0] == '>':
                        lines[i] = lines[i][1:]
                    lines[i] = '    ' + lines[i].strip()

        return ''.join(lines)
