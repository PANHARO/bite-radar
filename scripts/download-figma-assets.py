import concurrent.futures, json, pathlib, subprocess
root = pathlib.Path(__file__).resolve().parents[1]
target = root / 'assets' / 'figma'
target.mkdir(parents=True, exist_ok=True)
assets = json.loads((root / 'scripts/figma-assets.json').read_text())
def download(item):
    name, url = item
    path = target / name
    if not path.exists() or not path.stat().st_size:
        subprocess.run(['curl.exe', '-f', '-L', '--retry', '2', '-sS', url, '-o', str(path)], check=True)
    return name
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(download, assets.items()))
print(f'Downloaded and verified {len(results)} Figma assets')
