import ScrollNumber from "../component/ScrollNumber";
const {ccclass, property} = cc._decorator;

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
    speed = 500;



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.sn.rollSpeed = this.speed;
        // this.sn.setLabel(0, 50);
    }
    updateLabel(){
        if (this.sn.isAutoRoll) {
            this.lbSpeed.string = `速度:${Math.floor(this.sn.rollSpeed)}`
        }else{
            this.lbSpeed.string = `速度:${Math.floor(this.sn.speed)}`
        }
        
        this.lbcurNumIdx.string = `值:${this.sn.curNum}`;
    }

    onBtn(event,data){
        let newSpeed = this.sn.rollSpeed;
        if (data == '1') {
            newSpeed += 10
            this.sn.rollSpeed = newSpeed;
        }else if (data == '2') {
            newSpeed -= 10
            if (newSpeed < 0) {
                newSpeed = 0;
            }
            this.sn.rollSpeed = newSpeed;
        }else if(data == '3'){
            this.sn.isAutoRoll = !this.sn.isAutoRoll;
            if (!this.sn.isAutoRoll) {
                this.sn.speed = this.speed;
                this.sn.rolling = false;
            }
            let label = cc.find('Canvas/switch/Background/Label');
            label.getComponent(cc.Label).string = this.sn.isAutoRoll ? '开' : '关'
        }else if(data == '4'){
            if (this.sn.isAutoRoll) {
                return;
            }
            let num = this.getRandomInt(this.sn.minNum, this.sn.maxNum);
            this.sn.rollSpeed = this.speed;
            this.sn.scrollTo(num);
        }

        // newSpeed = Math.floor(newSpeed * 100)/100;
        // this.sn.updateSpeed(newSpeed);
        this.updateLabel();
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    update (dt) {
        this.updateLabel();
    }
}
