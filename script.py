# Libraries we need
import pyxhook
import time
import pyautogui
import zmq
import json
import signal
import sys
import threading
import xerox
import auto

auto.load()

auto.models.load_models("user_model.pkl")

lis=[  "Home","News","Contact","About",
        "Support","Blog","Tools","Base",
        "Custom","More","Logo","Friends",
        "Partners","People","Work",
    ]

s=""

context = zmq.Context()
sock1 = context.socket(zmq.PAIR)
sock1.bind("tcp://127.0.0.1:5684")

class mythread(threading.Thread):

    def __init__(self):
        threading.Thread.__init__(self)
        # self.sock2 = context.socket(zmq.PAIR)
        # self.sock2.bind("tcp://127.0.0.1:5682")
    def run(self):
        global s
        while True:
            print("sock active")
            messg = sock1.recv()
            # pyautogui.typewrite(messg.decode("utf-8") )
            messg = messg[len(s):]
            # for i in range(len(s)+1):
            #     pyautogui.press('backspace')
            time.sleep(.2)
            s=""
            xerox.copy(messg.decode("utf-8"))
            pyautogui.hotkey('ctrl', 'v')
            print(messg.decode("utf-8")+" recv. on socket1")

prev_key=""

def kbevent(event):
    global s
    global lis
    global prev_key
    print(event.Key)

    if ((event.Key<='Z' and event.Key>='A') or (event.Key>='a' and event.Key<='z') )and len(event.Key)==1 and prev_key!="Control_L":
        s+=event.Key
        print (s)
        # for testing sending sample list :lis
        lis=[]

        for i in auto.predict_currword_user(s):
            lis.append(i[0])

        temp=auto.predict_currword(s,25)
        for j in temp:
            if len(lis)>=10:
                break
            if j[0] not in lis:
                lis.append(j[0])

        sock1.send_string(json.dumps(lis))

    elif event.Key == 'Left' or event.Key == 'Right':
        print("")
    elif event.Key == 'Return' or event.Key == 'space':
        auto.models.train_models_user(s+" this","user_model.pkl")
        auto.models.save_models_user()
        sock1.send_string(json.dumps("$hide"))
        s=""
    elif event.Key == 'BackSpace':
        s=s[:-1] 
        
        if len(s)<1:
            sock1.send_string(json.dumps("$hide"))
        
        else:    
            lis=[]

            for i in auto.predict_currword_user(s):
                lis.append(i[0])

            temp=auto.predict_currword(s,25)
            for j in temp:
                if len(lis)>=10:
                    break
                if j[0] not in lis:
                    lis.append(j[0])

            sock1.send_string(json.dumps(lis))


    else :
        sock1.send_string(json.dumps("$hide"))        
        s=""

    # safely exit 
    if prev_key=="Control_L" and event.Key=="space":
        
        sock1.close()
        context.destroy()
        sys.exit(0)

    prev_key = event.Key

def main():
    global sock1
    # Define the socket using the "Context"s
    hookman = pyxhook.HookManager()
    # Define our callback to fire when a key is pressed down
    hookman.KeyDown = kbevent
    # Hook the keyboard
    hookman.HookKeyboard()
    # Start our listener
    hookman.start()

    thread1 = mythread()
    thread1.start()

if __name__ == '__main__':
    main()