
const { ccclass, property } = cc._decorator;
// 显示类型
export const ShowItemType = cc.Enum({
    LABEL: 0,
    SPRITE: 1
});
// 滚动方向
export const Direction = cc.Enum({
    TOP_TO_BOTTOM: 0,
    BOTTOM_TO_TOP: 1
})
// 数字排列顺序
export const Sort = cc.Enum({
    ASC: 0,  // 升序
    DESC: 1, //降序
})
@ccclass
export default class ScrollNumber extends cc.Component {

    @property({
        tooltip: '显示类型: 数字或图片选项,设置为文字时会调用 label, 设置图片时 需要设置 spriteList 精灵帧',
        type: ShowItemType,
    })
    showType = ShowItemType.LABEL;

    @property({ tooltip: '数字或图片选项的展示方向', type: Sort })
    itemSort = Sort.ASC;

    @property({ tooltip: '数字或图片选项的滚动方向', type: Direction })
    scrollDirection = Direction.TOP_TO_BOTTOM;

    @property({
        tooltip: '数字显示区',
        type: cc.Label,
        visible: function (this: ScrollNumber) { return this.showType == ShowItemType.LABEL }
    })
    label: cc.Label = null;

    @property({
        tooltip: '图片集,图片大小请保持一致,否则滚动数据不准确',
        type: [cc.SpriteFrame],
        visible: function (this: ScrollNumber) { return this.showType == ShowItemType.SPRITE }
    })
    spriteList: cc.SpriteFrame[] = [];

    @property({ tooltip: '行高', visible: function (this: ScrollNumber) { return this.showType == ShowItemType.LABEL } })
    labelLineHeight: number = 40;
    @property({ tooltip: '字体颜色', visible: function (this: ScrollNumber) { return this.showType == ShowItemType.LABEL } })
    fontColor: cc.Color = cc.color(255, 255, 255, 255);
    @property({ tooltip: '最小滚动值', visible: function (this: ScrollNumber) { return this.showType == ShowItemType.LABEL } })
    labelMinNum: number = 0;
    @property({ tooltip: '最大滚动值', visible: function (this: ScrollNumber) { return this.showType == ShowItemType.LABEL } })
    labelMaxNum: number = 9;

    @property({ tooltip: '数字滚动速度' })
    rollSpeed = 300;
    @property({ tooltip: '抽取随机数播放滚动动画时,滚动完当前圈后再次多滚动的圈数' })
    rollRound = 1;

    speed = 300;
    @property({ tooltip: '自动滚动开关' })
    isAutoRoll = true;
    // 默认显示数字
    @property({ tooltip: `当前显示的数字 maxMum`, visible: function (this: ScrollNumber) { return this.showType == ShowItemType.LABEL } })
    curNum = 0;
    // 索引
    curNumIdx = 0;
    maxNum: number = 9;
    minNum: number = 0;
    //播放时间
    time = 0;
    //播放总时间
    totalTime = 0;
    // label 行高
    lineHeight = 0
    // lable 总行数(实际数量+1)
    labelLineCount = 0;
    // label 总高度
    labelHeight = 0;
    // 加速度
    av = 0;
    rolling = false;
    // 当前需要展示的数字
    numArray = [];

    onLoad() {
        this.initLabel();
    }

    resetScrollNumber(type, sort, director, minNum, maxMum) {
        this.showType = type;
        this.itemSort = sort;
        this.scrollDirection = director;
        this.minNum = minNum;
        this.maxNum = this.maxNum;
        this.initLabel();
    }

    initLabel() {
        let labelStr = '';
        this.numArray = [];
        this.label.node.removeAllChildren();
        // 初始化图片
        if (this.showType == ShowItemType.SPRITE) {
            if (!this.spriteList || this.spriteList.length == 0) {
                cc.log('请设置图片集');
            }
            this.label.lineHeight = this.spriteList[0].getRect().height;

            if (this.itemSort == Sort.DESC) {
                let len = this.spriteList.length
                for (let i = len - 1; i >= 0; i--) {
                    this.addSprite(this.spriteList[i], this.label.node, i)
                }
                this.addSprite(this.spriteList[len - 1], this.label.node, len - 1);
            } else if (this.itemSort == Sort.ASC) {
                let len = this.spriteList.length
                for (let i = 0; i < len; i++) {
                    this.addSprite(this.spriteList[i], this.label.node, i)
                }
                this.addSprite(this.spriteList[0], this.label.node, 0);
            }
            // 调整位置;
            this.label.node.getComponent(cc.Layout).updateLayout();
            // 重置默认值
            this.minNum = 0;
            this.maxNum = this.spriteList.length - 1;
        }
        // 计算显示数字
        if (this.itemSort == Sort.DESC) {
            for (let i = this.maxNum; i >= this.minNum; i--) {
                labelStr += i + '\n';
            }
            labelStr += this.maxNum;
        } else if (this.itemSort == Sort.ASC) {
            for (let i = this.minNum; i <= this.maxNum; i++) {
                labelStr += i + '\n';
            }
            labelStr += this.minNum;
        }
        // 初始化 数字
        if (this.showType == ShowItemType.LABEL) {
            this.minNum = this.labelMinNum;
            this.maxNum = this.labelMaxNum;
            this.label.lineHeight = this.labelLineHeight;
            this.label.string = labelStr;
            this.label.node.color = this.fontColor;
        } else if (this.showType == ShowItemType.SPRITE) {
            this.label.string = '';
            this.label.node.color = cc.color(255, 255, 255, 255);
        }
        this.numArray = labelStr.split('\n');
        this.lineHeight = this.label.lineHeight;
        this.label.node.parent.height = this.lineHeight;
        let count = this.maxNum - this.minNum;
        this.labelLineCount = count + 2;
        this.label.node.height = this.labelLineCount * this.lineHeight;
        this.labelHeight = this.label.node.height;
        let idx = this.getCurNumIdx(this.curNum);
        if (idx) {
            this.curNumIdx = idx;
        } else {
            this.curNumIdx = 0;
        }
        this.curNum = this.getCurNum();
        this.label.node.y = this.getCurNumPositionY(this.curNum);
    }

    addSprite(sf, parent, idx?) {
        let node = new cc.Node();
        let sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = sf;
        if (cc.debug && idx != null) {
            let label = new cc.Node();
            label.color = cc.Color.RED;
            let lb = label.addComponent(cc.Label);
            lb.string = idx;
            label.parent = node;
        }
        parent.addChild(node);
    }

    getCurNumIdx(num) {
        for (let i = 0; i < this.numArray.length; i++) {
            if (this.numArray[i] == num) {
                return i;
            }
        }
    }

    getCurNum() {
        return this.numArray[this.curNumIdx];
    }

    getCurNumPositionY(num) {
        let y;
        let numIdx = this.getCurNumIdx(num);
        y = this.lineHeight * (numIdx - (this.labelLineCount / 2 - 0.5))
        return y;
    }

    updateCurNumByPosY(y) {
        let diffCell = y / this.lineHeight;
        this.curNumIdx = (this.labelLineCount) / 2 - 0.5 + diffCell
        if (this.curNumIdx == this.labelLineCount) {
            this.curNumIdx = 0;
        }
        this.curNumIdx = this.getIntegerNumIdx();
        this.curNum = this.numArray[this.curNumIdx]
        // cc.log('idx',this.curNumIdx,this.curNum);
    }

    getIntegerNumIdx() {
        let num = Math.round(this.curNumIdx)
        if (num >= this.maxNum - this.minNum + 1) {
            num = 0;
        }
        return num;
    }

    getLastPosY() {
        let y;
        if (this.scrollDirection == Direction.TOP_TO_BOTTOM) {
            y = - (this.labelLineCount * this.label.node.anchorY - 0.5) * this.lineHeight;
        } else if (this.scrollDirection == Direction.BOTTOM_TO_TOP) {
            y = (this.labelLineCount * this.label.node.anchorY - 0.5) * this.lineHeight;
        }
        return y;
    }
    getStartPosY() {
        let y;
        if (this.scrollDirection == Direction.TOP_TO_BOTTOM) {
            y = (this.labelLineCount * this.label.node.anchorY - 0.5) * this.lineHeight;
        } else if (this.scrollDirection == Direction.BOTTOM_TO_TOP) {
            y = -(this.labelLineCount * this.label.node.anchorY - 0.5) * this.lineHeight;
        }
        return y;
    }
    /**
     * 滚动到任意数字所在位置
     * @param num (图片模式时,num 代表图片索引值)
     */
    scrollTo(num) {
        if (this.rolling) {
            return;
        }
        let idx = this.getCurNumIdx(num);
        if (null == num || null == idx) {
            return;
        }
        cc.log('rdm', num);
        this.isAutoRoll = false;
        this.speed = this.rollSpeed;
        this.time = 0;
        this.rolling = true;
        // let a = this.speed / t;
        let height = (this.labelLineCount - 1) * this.lineHeight;
        let diffY;
        diffY = this.label.node.y - this.getCurNumPositionY(this.curNum);
        let roundLeft = 0; // 本轮剩余路程
        let rdmDistance = 0; // 随机点 距离开始位置的路程
        if (this.scrollDirection == Direction.TOP_TO_BOTTOM) {
            roundLeft = (this.curNumIdx + 1) * this.lineHeight - diffY;
            rdmDistance = (this.labelLineCount - 1 - (idx + 1)) * this.lineHeight;
        } else if (this.scrollDirection == Direction.BOTTOM_TO_TOP) {
            roundLeft = (this.labelLineCount - 1 - (this.curNumIdx + 1)) * this.lineHeight - diffY;
            rdmDistance = (idx + 1) * this.lineHeight;
        }
        let s = height * this.rollRound + rdmDistance + roundLeft;
        this.totalTime = (s * 2) / this.speed;
        this.av = - this.speed / this.totalTime;
    }


    update(dt) {
        if (!this.isAutoRoll || this.speed == 0) {
            if (!this.rolling) {
                return;
            }

            this.time += dt;
            if (this.time >= this.totalTime) {
                dt -= (this.time - this.totalTime);
                this.rolling = false;
            }

            let s = this.speed * dt + this.av * dt * dt * 0.5;
            this.updateLabel(s);
            this.speed += this.av * dt;
            return;
        } else {
            let s = this.rollSpeed * dt;
            this.updateLabel(s);
        }
    }

    updateLabel(s) {
        if (this.scrollDirection == Direction.TOP_TO_BOTTOM) {
            let diffY = this.label.node.y - s - this.getLastPosY();
            if (diffY < 0) {
                this.label.node.y = this.getStartPosY() + diffY;
            } else {
                this.label.node.y -= s;
            }
        } else if (this.scrollDirection == Direction.BOTTOM_TO_TOP) {
            let diffY = this.label.node.y + s - this.getLastPosY();
            if (diffY > 0) {
                this.label.node.y = this.getStartPosY() + diffY;
            } else {
                this.label.node.y += s;
            }
        }
        this.updateCurNumByPosY(this.label.node.y);
    }
}
