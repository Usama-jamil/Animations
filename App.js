import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { languagesData } from 'src/data/languagesData'
import { API_ENDPOINTS,getRequest } from 'src/utils/apiService'

const App = () => {
  console.log('languages data',languagesData)
  return (
    <SafeAreaView>
      <Text>App</Text>
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({})