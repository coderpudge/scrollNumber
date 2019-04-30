
const {ccclass, property} = cc._decorator;
let ShowItemType = cc.Enum({
    LABEL:0,
    SPRITE:1
});
let ScrollDirection = cc.Enum({
    TOP_TO_BOTTOM:0,
    BOTTOM_TO_TOP:1
})
@ccclass
export default class ScrollNumber extends cc.Component {

    @property({
        tooltip:'显示类型: 数字文字 或 图片,设置为文字时会调用 label, 设置图片时 需要设置 spriteList 精灵帧',
        type:ShowItemType,
    })
    showType = ShowItemType.LABEL;

    // @property({tooltip:'滚动方向',type: ScrollDirection })
    // direction = ScrollDirection.TOP_TO_BOTTOM;

    @property({
        tooltip:'数字显示区',
        type:cc.Label,
        visible: function(this:ScrollNumber) { return this.showType  == ShowItemType.LABEL} 
    })
    label: cc.Label = null;
    @property({
        tooltip:'图片集,图片大小请保持一致,否则滚动数据不准确',
        type:[cc.SpriteFrame],
        visible: function(this:ScrollNumber) { return this.showType  == ShowItemType.SPRITE} 
    })
    spriteList: cc.SpriteFrame[] = [];



    @property({tooltip:'最小滚动值',visible: function(this:ScrollNumber) { return this.showType  == ShowItemType.LABEL} })
    minNum: number = 0;
    @property({tooltip:'最大滚动值',visible: function(this:ScrollNumber) { return this.showType  == ShowItemType.LABEL} })
    maxNum: number = 9;

    @property({tooltip:'数字滚动速度'})
    rollSpeed = 300;
    @property({tooltip:'抽取随机数播放滚动动画时,滚动完当前圈后再次多滚动的圈数'})
    rollRound = 1;

    speed = 300;
    @property({tooltip:'自动滚动开关'})
    isAutoRoll = true;
    // 当前显示数字
    @property({tooltip:`当前显示的数字 maxMum`,visible: function(this:ScrollNumber) { return this.showType  == ShowItemType.LABEL} })
    curNum = 0;
    


    // @property({tooltip:`默认选中数字索引,索引范围 0~`}) //${this.maxMum - this.minNum + 1}
    curNumIdx = 0;
    //播放时间
    time = 0;
    //播放总时间
    totalTime = 0;
    // label 行高
    lineHeight = 0
    // label 总高度
    totalHeight = 0;
    // lable 行数
    totalNum = 0;
    // 加速度
    av = 0;
    rolling = false;
    
    getShowType(){
        return this.showType == ShowItemType.SPRITE;
    }

    onLoad () {
        this.initLabel();
        this.updateLabel();
    }

    setLabel(min,max){
        this.minNum = min;
        this.maxNum = max;
        this.initLabel();
    }

    initLabel(){
        
        let labelStr = '';
        if (this.showType == ShowItemType.LABEL) {
            for (let i = this.minNum; i <= this.maxNum; i++){
                labelStr += i + '\n';  
            }
            labelStr += this.minNum;
            
        }else if (this.showType == ShowItemType.SPRITE) {
            if (!this.spriteList || this.spriteList.length == 0) {
                cc.log('请设置图片集');
            }
            this.label.node.removeAllChildren();
            this.label.lineHeight = this.spriteList[0].getRect().height;
            for (let i = 0; i < this.spriteList.length; i++) {
                this.addSprite(this.spriteList[i], this.label.node)
            }
            this.addSprite(this.spriteList[0], this.label.node);
            // 调整位置;
            this.label.node.getComponent(cc.Layout).updateLayout();
            // 重置默认值
            this.minNum = 0;
            this.maxNum = this.spriteList.length - 1;
        }
        this.label.string = labelStr;
        this.lineHeight = this.label.lineHeight;
        this.label.node.parent.height = this.lineHeight;
        let count = this.maxNum - this.minNum;
        this.totalNum = count + 2;
        this.label.node.height = this.totalNum * this.lineHeight;
        this.totalHeight = this.label.node.height;
        let idx = this.getCurNumIdx(this.curNum);
        if (idx) {
            this.curNumIdx = idx;
        }
        // if (this.direction == ScrollDirection.TOP_TO_BOTTOM) {
            
        // }else if (this.direction == ScrollDirection.BOTTOM_TO_TOP) {
            
        // }
        // this.time = this.curNumIdx / this.speed;
    }

    addSprite(sf,parent){
        let node = new cc.Node();
        let sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = sf;
        parent.addChild(node);
    }

    getCurNumIdx(num){
        for (let i = this.minNum; i < this.maxNum; i++) {
            if (num == i) {
                return  i - this.minNum;
            }  
        }
    }

    getCurNum(){
        let num = Math.round(this.curNumIdx)
        if (num >= this.maxNum - this.minNum + 1) {
            num = 0;
        }
        return num + this.minNum;
    }
    
    /**
     * 根据 数字显示当前
     */
    updateLabel(){       
        this.label.node.y =  this.getCurNumPositionY(this.curNum);
    }

    getCurNumPositionY(num){
        let numIdx = this.getCurNumIdx(num);
        let showPosY = (numIdx - (this.totalNum - 1) * this.label.node.anchorY)  * this.lineHeight;
        let y =  showPosY - (0.5 - this.label.node.anchorY) * this.label.node.height;
        return y;
    }
    getCurNumByPosY(y){
        let showPosY =  y + (0.5 - this.label.node.anchorY) * this.label.node.height;
        this.curNumIdx = showPosY / this.lineHeight + (this.totalNum - 1) * this.label.node.anchorY;
        return this.getCurNum();
    }

    updateLabel2(s){
        
        let diffY = this.label.node.y + s - this.getLastPos();
        if (diffY > 0) {
            this.label.node.y = this.getStartPos() + diffY;
        }else{
            this.label.node.y += s;
        }
        this.curNum = this.getCurNumByPosY(this.label.node.y);
        this.curNumIdx = this.getCurNumIdx(this.curNum);
    }

    getLastPos(){
        let y = (this.totalNum * this.label.node.anchorY - 0.5) * this.lineHeight;
        return y;
    }
    getStartPos(){
        let y = - (this.totalNum * this.label.node.anchorY - 0.5) * this.lineHeight;
        return y;
    }

    scrollTo(num){
        if (this.rolling) {
            return;
        }
        let idx = this.getCurNumIdx(num);
        if (null == num || null==idx) {
            return;
        }
        cc.log('rdm',num);
        this.isAutoRoll = false;
        this.speed = this.rollSpeed;
        this.time = 0;
        this.rolling = true;
        // let a = this.speed / t;
        let height = (this.totalNum - 1) * this.lineHeight;
        let diffY = this.label.node.y - this.getCurNumPositionY(this.curNum);
        let roundLeft = (this.totalNum - 1 - (this.curNumIdx  + 1)) * this.lineHeight - diffY;
        let s = height * this.rollRound +  (idx + 1) * this.lineHeight  + roundLeft;
        this.totalTime = (s * 2) / this.speed;
        this.av = - this.speed / this.totalTime;
        
    }
    

    update (dt) {
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
            this.updateLabel2(s);
            this.speed += this.av * dt;
            return;
        }else{
            let s = this.rollSpeed * dt;
            this.updateLabel2(s);
        }
    }
}
