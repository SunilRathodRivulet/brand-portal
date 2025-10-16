<template>
  <v-app>
    <!-- ------------------------------------------------------------------ -->
    <!--  two-column layout                                               -->
    <!-- ------------------------------------------------------------------ -->
    <v-row no-gutters class="fill-height">
      <!-- 1. sidebar ---------------------------------------------------- -->
      <v-col cols="auto" class="flex-grow-0">
        <SideBar class="h-100" />
      </v-col>

      <!-- 2. header + page --------------------------------------------- -->
      <v-col class="d-flex flex-column">
        <!-- header with search ---------------------------------------- -->
        <Header class="flex-grow-0" />

        <!-- page content ---------------------------------------------- -->
        <v-main class="flex-grow-1">
          <v-container fluid>
            <NuxtPage />
          </v-container>
        </v-main>
      </v-col>
    </v-row>
  </v-app>
</template>

<script setup>
import Header  from '~/components/global/Header.vue'
import SideBar from '~/components/global/SideBar.vue'
</script>