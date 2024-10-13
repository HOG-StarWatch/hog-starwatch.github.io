export default [
    { text: '主页', link: '/' },
    { text: '设定集收录',
      items: [
        { text: 'StarCraftII', link: '/StarCraft/官方美术设定集' },
      ],
    },
    { text: '其他',
      items: [
        { text: 'SCP', link: 'https://hog-starwatch.github.io/SCP/', target: '_self', },
        { text: 'Novel', link: 'https://hog-starwatch.github.io/Novel/', target: '_self', },
      ],
    },
    { text: '小工具',
      items: [
        { text: '零宽隐写', link: '零宽隐写.html', target: '_self', },
        { text: '加密解密', link: '加密解密.html', target: '_self', },
        { text: 'Zip',
          items: [
            { text: '文件多合一', link: 'Zip.html', target: '_self', },
            { text: '文件夹合一', link: 'Zip-dir.html', target: '_self', },
          ],
        },
      ],
    },
    { text: '小游戏',
      items: [
        { text: 'Wordle', link: 'Wordle.html', target: '_self', },
        { text: '猜数字', link: '猜数字.html', target: '_self', },
      ],
    },
];