# checked_id
Demo of identifier format with embedded checksums.  The intended use of this kind of identifier is in situations where human error needs to be minimized.  For example, an identifier that might be written onto a paper form or read over the phone.  Because of this intended use, checksums are used to verify correctness and potentially confusing characters are omitted.

## Checksum Pattern
The checksum pattern is inspired by what is used with Hamming Codes.

The diagram below illustrates the pattern of checksum (c) and data (d) characters.  The asterisk indicates the characters that are used for calculating each checksum.  The character at index zero is a checksum of checksums, which will be calculated last.

```
cccd-cddd-cddd-dddd
0123-4567-89AB-CDEF
.c.*-.*.*-.*.*-.*.*
..c*-..**-..**-..**
....-c***-....-****
....-....-c***-****
c**.-*...-*...-....
```

These checksum can be used to determine possibly incorrect characters.  If only one character is incorrect, it is possible to correct the error.  If more than one character is incorrect, we can still determine that the ID is incorrect and know what characters should be double checked to manually correct them.

## Character Set

The identifier uses a base 32 number system, so each character represents five bits of data.  Since the alphabet and numeric digits together come to 36,and we only need 32, we can omit some characters.  For this demo, the following characters have been removed:

- O - The letter O can easily be confused for the number zero.
- E, P, T - These are letters that sound similar.  Since there are a limited number of characters that can be removed, C, D, G, and V still remain.  This can still provide some confusing, but it will be reduced a little.
