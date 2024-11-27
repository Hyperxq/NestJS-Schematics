# Schematics for NestJS

## Overview

This project provides a powerful schematic set designed to all the most powerful tool for schematics.

## Problem to solve

The problem this schematic solves is automating resource creation while reducing repetitive boilerplate and ensuring consistency. By simply defining the desired resource structure in a file, the schematic handles the generation process for you.

## Getting started

```sh
npm i -g @pbuilder/cli
```

```sh
builder add @pbuilder/nestjs
```

### New Resource

The purpose of this schematics is to generate a whole resource based on an existing file. That means you need to create to create a file and configure it.

Then the schematic will read all the files with the same type and generate the resource.

For this version we are using the next stack:

- Mongo with mongoose.
- Graphql with apollo federation.

Let's start!

#### Create the schema file

```sh
builder g @pbuilder/nestjs schema
```

examples of a mongoose schema:

```JSON
import * as mongoose from 'mongoose';

export const CustomerSchema = new mongoose.Schema({}, { versionKey: false });

CustomerSchema.add({
  customerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  isActive: { type: Boolean, required: true, default: true },
});

CustomerSchema.index({ email: 1 }, { unique: true });
```

```JSON
/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import { CalibratedSchema } from './calibrared.schema';

export const ProductSchema = new mongoose.Schema({}, { versionKey: false });

ProductSchema.add({
  calibrated: { type: CalibratedSchema, required: false },
  UPC: [
    {
      type: String,
      required: false,
    },
  ],

  status: {
    type: String,
    required: true,
  },
  imageUrl: { type: String, required: false },
  size: { type: String, required: true },
  closureType: { type: String, required: true },
  containerType: { type: String, required: true },
  brand: { type: String, required: true },
  liquidName: { type: String, required: true },
  unitsPerCase: { type: Number, required: true },
  itemNumber: { type: Number, required: true },
  category: {
    type: String,
    required: true,
  },
});

ProductSchema.index({ itemNumber: 1 }, { unique: true });

```

#### Generate the resource

With your file totally configure go to generate the resource

```sh
builder g @pbuilder/nestjs cgm
```

### Architecture under the hood

When we want to extends the ability to generate a resource based on a file it's important to understand how to do it.
