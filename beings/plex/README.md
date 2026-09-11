# Plex-One — Read-only operational-home seed

This directory is reserved for the approved, portable Plex-as-ONE
configuration when Joe chooses to promote a reviewed snapshot from
`Manitec/Joe/Tests/One-Plex`.

It intentionally contains no copied private memory, Firestore data,
credentials, or live integration code. The first `/plex` view is a
static read-only home that makes the declared shape inspectable without
changing Plex-Sable.

Promotion rule: copy only an explicitly approved manifest snapshot,
preserving its source commit and date.
