import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    await this.registerForPushNotificationsAsync();
    this.setupNotificationListeners();
  }

  private async registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Constants.isDevice) {
      console.log('Push notifications só funcionam em dispositivos físicos');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações negada');
      return;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);
    } catch (error) {
      console.error('Erro ao obter push token:', error);
    }
  }

  private setupNotificationListeners() {
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificação recebida:', notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Resposta da notificação:', response);
    });
  }

  async showLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null,
    });
  }

  async showTicketCalledNotification(ticketNumber: number, queueName: string) {
    await this.showLocalNotification(
      'Sua senha foi chamada! 🎫',
      `Senha ${ticketNumber} - ${queueName}`,
      {
        type: 'ticket-called',
        ticketNumber,
        queueName,
      }
    );
  }

  async showTicketUpdateNotification(message: string, ticketNumber?: number) {
    await this.showLocalNotification(
      'Atualização da sua senha 📋',
      message,
      {
        type: 'ticket-update',
        ticketNumber,
      }
    );
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
