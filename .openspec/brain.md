# SDD Brain: Zugzbot Lessons Learned

## [2026-05-23] Bitonal ASCII Art
- **Lesson**: Splitting ASCII art printing into multiple `cat << "EOF"` blocks allows for easy color manipulation of different sections of the same art piece without complex character-level escapes inside the HEREDOC.
- **Context**: Updated `install-plugin.sh` to use Cyan for the top half and Magenta for the bottom half.

## [2026-05-22] Branding Improvement
- **Lesson**: Using heredocs with quotes (`cat << "EOF"`) is essential for ASCII art in Bash to prevent the shell from interpreting special characters like backslashes as escape sequences.
- **Context**: Added "zugz" ASCII logo to `install-plugin.sh`.
