#!/usr/bin/env python3
"""JSON-lines bridge for one local POSIX PTY. Never listens on a network socket."""
import base64, errno, fcntl, json, os, pty, select, signal, struct, sys, termios

def emit(data):
    sys.stdout.write(json.dumps(data)+'\n');sys.stdout.flush()

shell=os.environ.get('SHELL','/bin/zsh')
if not os.path.isfile(shell):shell='/bin/zsh'
command='''if command -v claude >/dev/null 2>&1; then
  exec claude
else
  printf '\\033[38;5;115mClaude Code 极光终端\\033[0m\\r\\n'
  printf '尚未找到 claude 命令。安装并登录 Claude Code 后，在这里输入 claude 即可。\\r\\n'
  printf '官方安装说明：https://code.claude.com/docs/en/overview\\r\\n\\r\\n'
  exec "$SHELL" -l
fi'''
pid,master=pty.fork()
if pid==0:
    os.environ['TERM']='xterm-256color';os.environ['COLORTERM']='truecolor'
    os.environ['SHELL']=shell
    os.execv(shell,[shell,'-l'] if '--shell' in sys.argv else [shell,'-l','-i','-c',command])

def resize(cols,rows):
    cols=max(2,min(500,int(cols)));rows=max(2,min(200,int(rows)))
    fcntl.ioctl(master,termios.TIOCSWINSZ,struct.pack('HHHH',rows,cols,0,0))
    try:os.killpg(pid,signal.SIGWINCH)
    except ProcessLookupError:pass

def stop(*_):
    try:os.killpg(pid,signal.SIGHUP)
    except ProcessLookupError:pass
    try:os.close(master)
    except OSError:pass
    sys.exit(0)

signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGHUP,stop)
resize(100,30);pending=b''
try:
    while True:
        readable,_,_=select.select([master,sys.stdin.fileno()],[],[])
        if master in readable:
            try:data=os.read(master,16384)
            except OSError as e:
                if e.errno==errno.EIO:break
                raise
            if not data:break
            emit({'type':'output','data':base64.b64encode(data).decode('ascii')})
        if sys.stdin.fileno() in readable:
            chunk=os.read(sys.stdin.fileno(),65536)
            if not chunk:break
            pending+=chunk
            if len(pending)>262144:break
            while b'\n' in pending:
                line,pending=pending.split(b'\n',1)
                try:
                    message=json.loads(line)
                    if message.get('type')=='input':
                        data=base64.b64decode(message.get('data',''),validate=True)
                        while data:
                            written=os.write(master,data);data=data[written:]
                    elif message.get('type')=='resize':resize(message['cols'],message['rows'])
                except (ValueError,KeyError,TypeError):pass
finally:
    try:
        _,status=os.waitpid(pid,os.WNOHANG)
        emit({'type':'exit','code':os.waitstatus_to_exitcode(status)})
    except (ChildProcessError,BrokenPipeError):pass
    stop()
