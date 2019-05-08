import ScrollNumber, { Sort, Direction, ShowItemType } from "../component/ScrollNumber";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    lbSpeed: cc.Label = null;
    @property(cc.Label)
    lbcurNumIdx: cc.Label = null;
    @property(ScrollNumber)
    sn: ScrollNumber = null;
    @property(ScrollNumber)
    sn2: ScrollNumber = null;
    @property(ScrollNumber)
    sn3: ScrollNumber = null;
    speed = 100;

    start() {
        this.sn.rollSpeed = this.speed;
    }
    updateLabel() {
        if (this.sn.isAutoRoll) {
            this.lbSpeed.string = `速度:${Math.floor(this.sn.rollSpeed > 0 ? this.sn.rollSpeed : 0)}`
        } else {
            this.lbSpeed.string = `速度:${Math.floor(this.sn.speed > 0 ? this.sn.speed : 0)}`
        }

        this.lbcurNumIdx.string = `当前数字:${this.sn.curNum}`;
    }

    onBtn(event: cc.Event.EventTouch, data) {
        let label = cc.find('Background/Label', event.currentTarget).getComponent(cc.Label);
        let newSpeed = this.sn.rollSpeed;
        if (data == '1') {
            newSpeed += 10
            this.sn.rollSpeed = newSpeed;
        } else if (data == '2') {
            newSpeed -= 10
            if (newSpeed < 0) {
                newSpeed = 0;
            }
            this.sn.rollSpeed = newSpeed;
        } else if (data == '3') {
            this.sn.isAutoRoll = !this.sn.isAutoRoll;
            if (!this.sn.isAutoRoll) {
                this.sn.speed = this.speed;
                this.sn.rolling = false;
            }
            label.getComponent(cc.Label).string = this.sn.isAutoRoll ? '开' : '关'
        } else if (data == '4') {
            if (this.sn.isAutoRoll) {
                return;
            }
            let num = this.getRandomInt(this.sn.minNum, this.sn.maxNum);
            this.sn.rollSpeed = this.speed;
            this.sn.scrollTo(num);
        } else if (data == '5') {
            if (this.sn.itemSort == Sort.ASC) {
                this.sn.itemSort = Sort.DESC;
                label.string = '排:降'
            } else if (this.sn.itemSort == Sort.DESC) {
                this.sn.itemSort = Sort.ASC;
                label.string = '排:升'
            }
        } else if (data == '6') {
            if (this.sn.scrollDirection == Direction.TOP_TO_BOTTOM) {
                this.sn.scrollDirection = Direction.BOTTOM_TO_TOP
                label.string = '向上滚动'
            } else if (this.sn.scrollDirection == Direction.BOTTOM_TO_TOP) {
                this.sn.scrollDirection = Direction.TOP_TO_BOTTOM
                label.string = '向下滚动'
            }
        } else if (data == '7') {
            if (this.sn.showType == ShowItemType.LABEL) {
                this.sn.showType = ShowItemType.SPRITE
                label.string = '图片模式'
            } else if (this.sn.showType == ShowItemType.SPRITE) {
                this.sn.showType = ShowItemType.LABEL
                label.string = '数字模式'
            }
        }

        this.sn.initLabel();
        this.updateLabel();
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    update(dt) {
        this.updateLabel();
    }
}
