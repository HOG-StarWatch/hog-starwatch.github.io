*   作者：Mandarava（鳗驼螺）
*   微博：@鳗驼螺pro

这篇文章前半部分将研究MV游戏的存档、读档过程，从而实现一个MV游戏存档修改器。后半部分则是实现一个防止存档被修改的MV存档保护插件。

找出MV存档和读档的方式
------------

`DataManager` 类用于管理数据库和游戏对象，包括游戏的存档、读档。`DataManager` 使用`DataManager.saveGame()` 方法来存档，用`DataManager.loadGame()` 方法来读档。在存档过程中，它会实际调用`DataManager.saveGameWithoutRescue()` 来保存存档数据。看一下这个方法的具体实现：

```
DataManager.saveGameWithoutRescue = function(savefileId) {
    var json = JsonEx.stringify(this.makeSaveContents());
    if (json.length >= 200000) {
        console.warn('Save data too big!');
    }
    StorageManager.save(savefileId, json);
    this._lastAccessedId = savefileId;
    var globalInfo = this.loadGlobalInfo() || [];
    globalInfo[savefileId] = this.makeSavefileInfo();
    this.saveGlobalInfo(globalInfo);
    return true;
};

```

首先，它会先用`DataManager.makeSaveContents()` 方法将需要存入存档的数据（包括 `$gameSystem,$gameScreen,$gameTimer,$gameSwitches,$gameVariables,$gameSelfSwitches,$gameActors,$gameParty,$gameMap,$gamePlayer` 等10个全局变量的数据）合并成一个对象`contents`。`DataManager.makeSaveContents`的实现代码如下：

```
DataManager.makeSaveContents = function() {
    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
    var contents = {};
    contents.system       = $gameSystem;
    contents.screen       = $gameScreen;
    contents.timer        = $gameTimer;
    contents.switches     = $gameSwitches;
    contents.variables    = $gameVariables;
    contents.selfSwitches = $gameSelfSwitches;
    contents.actors       = $gameActors;
    contents.party        = $gameParty;
    contents.map          = $gameMap;
    contents.player       = $gamePlayer;
    return contents;
};

```

然后使用`JsonEx.stringify` 方法将这个对象进行json序列化转换成json字符串。（说句题外话，从这里也可以看出，如果我们要保存自定义的变量、数据到存档中，只需要以属性的方式添加给这10个全局对象中的任意一个即可，非常简单。）然后再调用`StorageManager.save(savefileId, json)` 方法将json字符串保存到存档文件中（在读档时，这个json字符串会被反序列化成那10个全局对象）。

再看一下`StorageManager.save` 方法的实现（如下面的代码）。对于本地数据，它会实际调用`saveToLocalFile` 方法去保存数据。

```
StorageManager.save = function(savefileId, json) {
    if (this.isLocalMode()) {
        this.saveToLocalFile(savefileId, json);
    } else {
        this.saveToWebStorage(savefileId, json);
    }
};

```

下面的代码是`StorageManager.saveToLocalFile` 方法的实现。在正式保存前它会用`LZString.compressToBase64` 方法将json字符串编码成Base64字符串。

```
StorageManager.saveToLocalFile = function(savefileId, json) {
    var data = LZString.compressToBase64(json);
    var fs = require('fs');
    var dirPath = this.localFileDirectoryPath();
    var filePath = this.localFilePath(savefileId);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(filePath, data);
};

```

类似的，对于读档过程，我们最终也会追踪到一个类似的方法，`StorageManager.loadFromLocalFile` 方法。在这个方法里，它会将存档中的内容使用`LZString.decompressFromBase64` 方法来还原成json字符串。

```
StorageManager.loadFromLocalFile = function(savefileId) {
    var data = null;
    var fs = require('fs');
    var filePath = this.localFilePath(savefileId);
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, { encoding: 'utf8' });
    }
    return LZString.decompressFromBase64(data);
};

```

所以，实际上MV的存档内容就是使用`LZString.compressToBase64` 方法编码过的Base64字符串，而存档的解密方法就是用`LZString.decompressFromBase64` 方法进行反向解码操作。

制作MV存档的修改器
----------

经过以上分析，现在只需要将`LZString` 的代码复制出来，简单的用HTML+Javascript技术就能做出一个MV存档的解密、加密工具，这个工具我放在github上，有兴趣的可以从 [这里](https://link.jianshu.com/?t=https://github.com/XMandarava/Plugins4RMMV/blob/master/others/mv_profile_modifier.html) 下载。  
用这个工具来测试一下MV的存档数据，效果如下图，真实数据都被解密出来了，只需要将真实数据进行一下修改，然后再重新加密，将加密的内容复制回存档保存就完成了存档的修改。

![](https://upload-images.jianshu.io/upload_images/1293833-b30255503519c4de.png)

MV存档测试

如何保护存档？
-------

为防止存档被随意修改，可以对存档内容进行加密，在读档时也要相应的作解密操作。通过分析，进行加密操作的最佳位置是在`DataManager.saveGameWithoutRescue` 方法中进行，当全局对象被序列化成json字符串后，立即对json字符串进行加密。而解密过程相应的放在`DataManager.loadGameWithoutRescue` 中进行。`LZString`的作用是对字符串进行压缩，当然你也可以只重写`LZString.compressToBase64`和`LZString.decompressFromBase64`方法，在实现压缩/还原的时候同时实现字符串的加密与解密，本质上没有差别，但直接修改`LZString` 影响面会比较广，所有调用这二个方法的代码都会有影响，包括`global.rpgsave` 的数据也会被加密。

制作一个存档保护插件
----------

接下来就来制作一个存档保护插件。这里只需要重写`DataManager.saveGameWithoutRescue`方法，实现json字符串加密，重写`DataManager.loadGameWithoutRescue`方法，实现json字符串的解密还原即可。完整的代码如下（本插件的最新版本可以在[这里](https://link.jianshu.com/?t=https://github.com/XMandarava/Plugins4RMMV/blob/master/indie/MND_ProtectProfile2.js)下载）。其中`encrypt`和`decrypt`方法是字符串的加密、解密方法。加密时，它会先对json字符串先进行一次`LZString`压缩，然后用凯撒加密算法（本算法修改自 [这里](https://link.jianshu.com/?t=https://github.com/bukinoshita/caesar-encrypt)）对压缩过的字符串进行加密，解密时就是反向操作。凯撒加解密算法简单、强度不高，好处是不会增加字符串长度，[这里](https://link.jianshu.com/?t=https://github.com/XMandarava/Plugins4RMMV/blob/master/indie/MND_ProtectProfile.js) 还有个相对高强度的版本，可以设定字符串密码，但缺点是会增加存档内容的长度。你也可以用自己的算法（比如DES, AES等）来代替（PS：如果要更换算法，注意验证算法是否支持对中文的加密解密，如果不支持中文，你可以像这里一样先用`LZString`对它进行一次压缩操作）。

```
//==============================
// MND_ProtectProfile2.js
// Copyright (c) 2017 Mandarava
// Homepage: www.popotu.com
//==============================

/*:
 * @plugindesc 用于加密存档的插件，可指定加密密码。(v1.0)
 * @author Mandarava（鳗驼螺）
 * @version 1.0
 *
 * @param Password
 * @text 存档密码
 * @desc 任意数字，通常取0~26之间的数字。
 * @type Number
 * @default 66
 *
 * @help
 * 使用时请修改存档密码，不要使用默认值哦！
 * 本插件采用凯撒加密算法，强度较低，好处是不会增加存档内容长度。可以采取的提高
 * 算法强度的方法，包括：对几偶数上的字符采用不同的偏移量，在特定位置添加混淆字
 * 符或字符串等。要使用加密强度较高的版本请使用 MND_ProtectProfile.js 插件。
 *
 * by Mandarava(鳗驼螺）
 */

(function($){

    var params=PluginManager.parameters("MND_ProtectProfile2");
    var password=Number(params["Password"]) || 66;

    DataManager.saveGameWithoutRescue = function(savefileId) {
        var json = JsonEx.stringify(this.makeSaveContents());
        if (json.length >= 200000) {
            console.warn('Save data too big!');
        }
        json=encrypt(json, password); //对json字符串进行加密
        StorageManager.save(savefileId, json);
        this._lastAccessedId = savefileId;
        var globalInfo = this.loadGlobalInfo() || [];
        globalInfo[savefileId] = this.makeSavefileInfo();
        this.saveGlobalInfo(globalInfo);
        return true;
    };

    DataManager.loadGameWithoutRescue = function(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if (this.isThisGameFile(savefileId)) {
            var json = StorageManager.load(savefileId);
            json=decrypt(json, password); //对加密过的json字符串进行解密
            this.createGameObjects();
            this.extractSaveContents(JsonEx.parse(json));
            this._lastAccessedId = savefileId;
            return true;
        } else {
            return false;
        }
    };

    //===字符串加密解密算法=========
    //凯撒加密算法改自：https://github.com/bukinoshita/caesar-encrypt
    function numToChar(num){
        return String.fromCharCode(97 + num);
    }
    function charToNum(char){
        return char.charCodeAt(0) - 97;
    }
    function caesar(char, shift){
        return numToChar(charToNum(char) + (shift % 26));
    }
    function caesarDec(char, shift){
        return numToChar(charToNum(char) - (shift % 26));
    }
    function encryptByCaesar(value, shift){
        var letters = value.split('');
        return letters.map(function (letter) { return caesar(letter, shift); }).join("");
    }
    function decryptByCaesar(value, shift){
        var letters = value.split('');
        return letters.map(function (letter) { return caesarDec(letter, shift); }).join("");
    }

    /**
     * 加密字符串
     * @param text 要加密的字符串
     * @param shift 解密密码（任意数字，通常取0~26之间的数字）
     * @returns {*}
     */
    function encrypt(text, shift) {
        var result=LZString.compressToBase64(text);
        result=encryptByCaesar(result, shift);
        return result;
    }

    /**
     * 解密字符串
     * @param text 要解密的字符串
     * @param shift 解密密码（任意数字，通常取0~26之间的数字）
     */
    function decrypt(text, shift) {
        var result=decryptByCaesar(text, shift);
        result=LZString.decompressFromBase64(result);
        return result;
    }
    //===========================

})();

```

现在，可以运行一下游戏，然后保存游戏，退出游戏再加载游戏，一切都没有问题，说明存档、读档都是正常的。然后，再用前面做的MV存档修改工具测试一下存档数据是否能被解密。在开发期间，存档会保存到`[项目目录]\save` 文件夹下，用记事本打开该文件夹下的名称类似`file1.rpgsave`、`file2.rpgsave` 的存档文件，复制其内容，粘贴到存档修改工具的密文框中，点击“解密”，解出来的数据仍然是加过密的字符串，根本无法修改。这样，这个存档保护插件就完成了。

![](https://upload-images.jianshu.io/upload_images/1293833-8930a089caedd2c1.png)

存档解密测试


PS：在`DataManager.saveGame` 方法中，在存档时，如果玩家是以覆盖旧存档的方式进行新存档的，那么MV会使用`StorageManager.backup` 方法对被覆盖的旧存档进行一次备份，以便在存档失败时通过`StorageManager.restoreBackup` 方法恢复。在`StorageManager.backup` 方法中看似对存档数据又进行了一次`LZString.compressToBase64`压缩，但际上它在使用`StorageManager.loadFromLocalFile` 方法读取旧存档数据时，那个方法会对数据进行一次`LZString.decompressFromBase64`解压。所以，二相抵消，实际上它并没有改变任何数据。所以`StorageManager.backup`和`StorageManager.restoreBackup`方法不需要重写。

by Mandarava（鳗驼螺）2017.08.15

  

本文转自 [https://www.jianshu.com/p/4ae309d45c93](https://www.jianshu.com/p/4ae309d45c93)，如有侵权，请联系删除。