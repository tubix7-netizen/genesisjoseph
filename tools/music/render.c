// Event-list renderer using TinySoundFont.
// usage: render <soundfont.sf2> <events.txt> <out.f32>
// events (one per line, times in seconds):
//   SR <rate>                      LEN <seconds>
//   P <ch> <bank> <preset> [drum]  set channel instrument (drum=1 for percussion channel)
//   V <ch> <0..1>                  channel volume        PAN <ch> <-1..1>
//   N <t> <ch> <key> <vel0..1> <dur>
//   C <t> <ch> <cc> <0..127>       control change        B <t> <ch> <0..16383> pitch wheel
#define TSF_IMPLEMENTATION
#include "tsf/tsf.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { double t; int type; int ch; int a; float v; } Ev; // type: 0 off, 1 on, 2 cc, 3 bend
static Ev *ev = NULL; static int nev = 0, cap = 0;
static void add(double t, int type, int ch, int a, float v) { if (nev == cap) { cap = cap ? cap * 2 : 4096; ev = realloc(ev, cap * sizeof(Ev)); } ev[nev++] = (Ev){ t, type, ch, a, v }; }
static int cmp(const void *x, const void *y) { const Ev *a = x, *b = y; if (a->t < b->t) return -1; if (a->t > b->t) return 1; return a->type - b->type; } // offs before ons at the same time

int main(int argc, char **argv) {
  if (argc < 4) { fprintf(stderr, "usage\n"); return 1; }
  tsf *f = tsf_load_filename(argv[1]); if (!f) { fprintf(stderr, "sf2 load failed\n"); return 1; }
  FILE *in = fopen(argv[2], "r"); if (!in) return 1;
  int sr = 44100; double len = 10; char line[512];
  tsf_set_max_voices(f, 256);
  // first pass: settings
  while (fgets(line, sizeof line, in)) {
    char k[8]; if (sscanf(line, "%7s", k) != 1) continue;
    if (!strcmp(k, "SR")) sscanf(line + 2, "%d", &sr);
    else if (!strcmp(k, "LEN")) sscanf(line + 3, "%lf", &len);
  }
  tsf_set_output(f, TSF_STEREO_INTERLEAVED, sr, -6.0f);
  rewind(in);
  while (fgets(line, sizeof line, in)) {
    char k[8]; if (sscanf(line, "%7s", k) != 1) continue;
    if (!strcmp(k, "P")) { int ch, bank, pr, dr = 0; int n = sscanf(line + 1, "%d %d %d %d", &ch, &bank, &pr, &dr); if (n >= 3) { if (dr) tsf_channel_set_presetnumber(f, ch, pr, 1); else if (!tsf_channel_set_bank_preset(f, ch, bank, pr)) { fprintf(stderr, "no preset %d:%d, fallback\n", bank, pr); tsf_channel_set_bank_preset(f, ch, 0, pr); } } }
    else if (!strcmp(k, "V")) { int ch; float v; sscanf(line + 1, "%d %f", &ch, &v); tsf_channel_set_volume(f, ch, v); }
    else if (!strcmp(k, "PAN")) { int ch; float v; sscanf(line + 3, "%d %f", &ch, &v); tsf_channel_set_pan(f, ch, (v + 1) * 0.5f); }
    else if (!strcmp(k, "N")) { double t, d; int ch, key; float vel; sscanf(line + 1, "%lf %d %d %f %lf", &t, &ch, &key, &vel, &d); add(t, 1, ch, key, vel); add(t + d, 0, ch, key, 0); }
    else if (!strcmp(k, "C")) { double t; int ch, cc, v; sscanf(line + 1, "%lf %d %d %d", &t, &ch, &cc, &v); add(t, 2, ch, cc, (float)v); }
    else if (!strcmp(k, "B")) { double t; int ch, v; sscanf(line + 1, "%lf %d %d", &t, &ch, &v); add(t, 3, ch, v, 0); }
  }
  fclose(in);
  qsort(ev, nev, sizeof(Ev), cmp);
  long total = (long)(len * sr); FILE *out = fopen(argv[3], "wb"); float *buf = malloc(sizeof(float) * 2 * 4096);
  long pos = 0; int ei = 0;
  while (pos < total) {
    while (ei < nev && (long)(ev[ei].t * sr) <= pos) {
      Ev *e = &ev[ei++];
      if (e->type == 1) tsf_channel_note_on(f, e->ch, e->a, e->v);
      else if (e->type == 0) tsf_channel_note_off(f, e->ch, e->a);
      else if (e->type == 2) tsf_channel_midi_control(f, e->ch, e->a, (int)e->v);
      else if (e->type == 3) tsf_channel_set_pitchwheel(f, e->ch, e->a);
    }
    long next = ei < nev ? (long)(ev[ei].t * sr) : total; if (next > total) next = total;
    long n = next - pos; if (n <= 0) n = 1; if (n > 4096) n = 4096;
    tsf_render_float(f, buf, (int)n, 0);
    fwrite(buf, sizeof(float), 2 * n, out); pos += n;
  }
  fclose(out); tsf_close(f); return 0;
}
