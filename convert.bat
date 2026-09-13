@echo off
echo ==============================================
echo   Anki to QA Webpage Converter
echo ==============================================
node --preserve-symlinks-main convert.js
if %errorlevel% equ 0 (
    echo.
    echo Conversion completed successfully! HTML files generated in html folder.
) else (
    echo.
    echo Error occurred during conversion. Please make sure Node.js is installed.
)
echo.
pause