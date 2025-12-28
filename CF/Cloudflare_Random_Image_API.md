# 随机图片 API 部署指南

本项目包含一个 Python 脚本用于预生成哈希命名的图片库，结合 Cloudflare Pages 的重写规则（Rewrite URL），实现访问目录路径即可返回该分类下的随机图片（无服务器计算成本）。

## 1. 准备工作

### 目录结构
确保你的工作目录包含以下内容：
- `gen_img.py`: 生成脚本
- `oriImg/`: 存放原始图片的文件夹（需自行创建）

在 `oriImg` 文件夹中，按照分类创建子文件夹，并将图片放入其中。例如：
```text
random-img-url/
├── gen_img.py
└── oriImg/
    ├── pc/
    │   ├── wallpaper1.jpg
    │   └── wallpaper2.png
    └── mobile/
        ├── background1.jpg
        └── ...
```

## 2. 生成图片库

运行 Python 脚本：

```bash
python gen_img.py
```

**脚本作用：**
1. 读取 `oriImg` 下的所有分类文件夹。
2. 在 `dist` 目录下生成对应的分类文件夹。
3. 将图片复制并重命名为 16 进制哈希文件名（如 `00.jpg`, `01.jpg` ... `ff.jpg`）。
   - 默认配置 `HASH_LENGTH = 2`，每个分类生成 256 张图片（重复填充）。
   - 统一输出后缀为 `.jpg`。

生成后的 `dist` 目录结构：
```text
dist/
├── pc/
│   ├── 00.jpg
│   ├── ...
│   └── ff.jpg
└── mobile/
    ├── ...
```

## 3. 部署到 Cloudflare Pages

1. 将包含 `dist` 目录的项目上传到 GitHub/GitLab，或者直接使用 Cloudflare Pages 的 Direct Upload 功能上传 `dist` 文件夹。
2. 在 Cloudflare Pages 项目设置中，绑定你的自定义域名（例如 `img.mydomain.com`）。

## 4. 配置 Cloudflare 重写规则

为了实现访问 `https://img.mydomain.com/pc` 自动随机返回 `/pc/xx.jpg`，需要配置转换规则。

1. 进入 Cloudflare 仪表盘，选择你的域名。
2. 导航到 **规则 (Rules)** > **转换规则 (Transform Rules)**。
3. 点击 **创建转换规则 (Create transform rule)**，选择 **重写 URL (Rewrite URL)**。

### 规则设置详情

- **规则名称**: Random Image Rewrite (或任意名称)
- **如果传入请求匹配…**
- **自定义筛选表达式 (Custom filter expression)**:
  - 点击 **编辑表达式 (Edit expression)** 或使用构建器：
    - **字段 (Field)**: `主机名 (Hostname)`
    - **运算符 (Operator)**: `等于 (equals)`
    - **值 (Value)**: `img.mydomain.com` (替换为你绑定的实际域名)

- **则...**
- **重写到...**:
  - 选择 **动态 (Dynamic)**
  - **表达式 (Expression)**:
    ```
    concat("/", http.request.uri.path, "/", substring(uuidv4(cf.random_seed), 0, 2), ".jpg")
    ```
    > **说明**: 该表达式将请求路径（如 `/pc`）与随机生成的 2 位 16 进制字符串拼接，构造出如 `//pc/a5.jpg` 的路径，指向 `dist` 中对应的静态文件。

- **查询 (Query)**:
  - 选择 **保留 (Preserve)** (保留原始请求中的查询参数)

1. 点击 **部署 (Deploy)** 保存规则。

## 5. 测试

访问以下 URL 进行测试（假设分类名为 `pc`）：
- `https://img.mydomain.com/pc`

每次刷新应该会显示该分类下的不同随机图片。

# 源码
```python
import os
import shutil
from pathlib import Path
from itertools import cycle

# 脚本用途：根据 oriImg 的子文件夹分类，预生成固定数量的十六进制命名图片到 dist，
# 结合 Cloudflare Pages 的 URL 重写规则，实现“按分类返回随机图片”的静态方案。
# 使用方法：在 oriImg/ 下创建分类子文件夹并放置图片，运行 `python gen_img.py`。

# 基本配置
SOURCE_DIR = Path("oriImg")
OUTPUT_DIR = Path("dist")

# ---------------------------------------------------------
# 核心配置：HASH_LENGTH 控制每个分类生成的文件总数
# 2 => 16^2 = 256 个文件
# 3 => 16^3 = 4096 个文件
# 若在 Cloudflare 重写表达式中使用 substring(uuidv4(cf.random_seed), 0, N)，
# 请确保 N 与此处的 HASH_LENGTH 保持一致，以命中生成的文件范围。
# ---------------------------------------------------------
HASH_LENGTH = 2
NUM_FILES = 16 ** HASH_LENGTH

# 输出文件后缀
# 说明：脚本不做格式转换，仅复制并重命名为统一后缀。
# 建议源图片格式与 OUTPUT_EXT 保持一致（默认 .jpg），并在 Cloudflare 规则中使用相同后缀，
# 以避免“文件编码与扩展名不一致”导致的内容类型问题。
OUTPUT_EXT = ".jpg" 

def ensure_dir(path: Path):
    if not path.exists():
        path.mkdir(parents=True)

def process_category(category_name: str, source_files: list):
    """处理单个分类：将源图片循环复制，填充至固定数量，并以十六进制序号命名"""
    category_output_dir = OUTPUT_DIR / category_name
    ensure_dir(category_output_dir)
    
    # 清空该分类输出目录，避免旧文件残留
    for item in category_output_dir.iterdir():
        if item.is_file():
            item.unlink()

    num_source_imgs = len(source_files)
    if num_source_imgs == 0:
        return

    # 计算平均复制次数（用于提示）
    avg_copies = NUM_FILES / num_source_imgs
    print(f"  [{category_name}] Found {num_source_imgs} images. Generating {NUM_FILES} files...")

    img_cycle = cycle(source_files)
    count = 0
    
    for i in range(NUM_FILES):
        src_img = next(img_cycle)
        
        # 生成十六进制文件名：当 HASH_LENGTH=2 时为 00.jpg ... ff.jpg；为 3 时为 000.jpg ... fff.jpg
        file_name = f"{i:0{HASH_LENGTH}x}{OUTPUT_EXT}"
        dest_path = category_output_dir / file_name
        
        shutil.copy(src_img, dest_path)
        count += 1
        
    print(f"  [{category_name}] Done. {count} files generated.")

def main():
    if not SOURCE_DIR.exists():
        print(f"Error: Source directory '{SOURCE_DIR}' does not exist.")
        return

    # 1. 准备输出根目录（存在时不强制删除，避免误删其他内容）
    if OUTPUT_DIR.exists():
        # 如需完全清理，可手动删除后再运行；当前策略由子目录生成阶段覆盖旧文件
        pass
    else:
        ensure_dir(OUTPUT_DIR)

    # 2. 扫描一级子目录（作为分类入口）
    # 根据当前需求，仅处理子文件夹；根目录直接放图片的情况不在本脚本处理范围
    
    subdirs = [d for d in SOURCE_DIR.iterdir() if d.is_dir()]
    
    # 说明：如需支持根目录图片，可扩展为 default 分类；此处保持简洁，仅处理子目录。
    
    if not subdirs:
        print(f"No subdirectories found in {SOURCE_DIR}. Please create category folders (e.g. {SOURCE_DIR}/pc).")
        return

    print(f"Found {len(subdirs)} categories: {[d.name for d in subdirs]}")

    extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

    for subdir in subdirs:
        category = subdir.name
        images = sorted([
            f for f in subdir.iterdir() 
            if f.is_file() and f.suffix.lower() in extensions
        ])
        
        if images:
            process_category(category, images)
        else:
            print(f"  [{category}] No images found, skipping.")

    print(f"\nAll done. Check '{OUTPUT_DIR}' directory.")

if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()

```