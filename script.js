const DEVICE_NAME = "UNO R4 LED"
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214";
const BLEconnection = {
    disconnected: 0,
    connected:    1,
};
let BLEstatus = BLEconnection.disconnected;
let BLEserver = null;
let BLEdevice = null;
let BLEservice = null;
let BLEcharacteristic = null;

function window_fix(){
    $('body').css({
        'position': 'fixed',
        'top': '-' + $(window).scrollTop() + 'px',
    });
}

addEventListener("load", function(e) {
    document.querySelector('#test').innerHTML = 'Hello, world!';
    BLEstatus = BLEconnection.disconnected;
    window_fix();
});

const onDisconnected = () => {
    console.log("> Bluetooth Device disconnected");
}

document.querySelector(".button").addEventListener("click", async (e) => {
    console.log('Execute : requestDevice');
    if(BLEstatus == BLEconnection.connected){
        console.log("already connectred");
        return;
    }
    try {
        await navigator.bluetooth.requestDevice({
            acceptAllDevices: false,
            name: "DEVIDE_NAME",
            filters: [
                {services: [SERVICE_UUID]}
            ],
            optionalServices: [SERVICE_UUID]
        })
        .then(async device => {
            BLEdevice = device;
            console.log("device selected");
            console.log("device.id    : " + BLEdevice.id);
            console.log("device.name  : " + BLEdevice.name);
            console.log("device.uuids : " + BLEdevice.uuids);
            BLEdevice.addEventListener("gattserverdisconnected", onDisconnected);
            return await device.gatt.connect();
        })
        .then(async server => {
            console.log("BLE connected");
            BLEserver = server;
            BLEstatus = BLEconnection.connected;
            return await BLEserver.getPrimaryService(SERVICE_UUID);
        })
        .then(async service => {
            console.log("get seivice");
            BLEservice = service;
            return await BLEservice.getCharacteristic(CHARACTERISTIC_UUID);
        })
        .then(async characteristic => {
            console.log("get characteristic");
            BLEcharacteristic = characteristic;
        });
    } catch(error) {
        console.log("failed to selecting  device", error);
        return;
    }
});

document.querySelector(".send_one").addEventListener("click", (e) => {
    console.log('Execute : send 1 to device ');
    if(BLEcharacteristic != null){
        try{
            BLEcharacteristic.writeValue(new Uint8Array([1]));
        } catch(error) {
            console.log("failed to send data", error);
        }
    }else{
        console.log("BLEservice is null");
    }
});

document.querySelector(".send_zero").addEventListener("click",  (e) => {
    console.log('Execute : send 0 to device');
    if(BLEcharacteristic != null){
        try{
            BLEcharacteristic.writeValue(new Uint8Array([0]));
        } catch(error) {
            console.log("failed to send data", error);
        }
    }else{
        console.log("BLEservice is null");
    }
});

document.querySelector(".disconnect").addEventListener("click", async (e) => {
    if(BLEstatus == BLEconnection.connected){
        console.log('Execute : discnnect');
        BLEserver.disconnect();
        BLEstatus = BLEconnection.disconnected;
    } else {
        console.log("no connected dedice");
    }
});